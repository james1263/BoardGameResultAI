// 星河交匯（Sidereal Confluence）卡表資料：物種、物種牌庫、殖民地、研究團隊、科技分享獎勵。
// 用途：之後聚會房間／小工具要把「每個人有什麼轉換器、場上有哪些殖民地與研究團隊」一次秀出來時用；暫時沒有被任何元件引用。
// 來源：①BGG 檔案 Sidereal_Confluence_Card_List.ods（工作表 Factions、Remastered Card List；作者、版本未標〔未驗證〕，是玩家整理的表，不是官方）②官方 Race Guide（難度、需求資源、玩法提示，只寫自己話的摘要）③快速複習檔 siderealConfluence.ts（用詞；殖民地支援與平手判定數字已與 ods 核對，9 個基本物種完全一致）④Sidereal_Confluence_Factions.pdf（18 個派系的難度、影響度、特性與玩法提示，含擴充派系）⑤Sidereal_Confluence_FactionsCards.pdf（派系卡圖表，需求資源與起始卡）⑥Faction Cheat Sheets v1.1（玩家整理的派系提示）⑦Player_Aid.pdf（回合流程與終局計分）⑧匈牙利文 Remastered 派系卡（只當交叉核對，內容以英文為準）⑨官方英文派系說明 PDF 九份（Caylion、Eni Et、Faderan、Im’dril、Kjas、Kt、Unity、Yengii、Zeth；玩法提示與規則細節以它們為準）⑩西班牙文與德文玩家輔助（只核對資源名稱與換算）⑪義大利文規則書（核對 Faderan 起始庫存）。
// 中文：官方沒有中文卡名，卡名與物種名保留英文（物種名用快速複習檔的 ’ 撇號，卡名照 ods 原字串）；物種暱稱、玩法摘要是 AI 自譯，標【待核對】。卡片的轉換器沒有逐張翻成中文，保留 ods 的簡寫字串，符號意思見 SIDEREAL_NOTATION。
// 沒收什麼：①擴充 Bifurcation 的牌庫（只收 9 個擴充派系的基本數字、起始庫存字串與特性摘要；牌庫公式在 ods 的 Bifurcation Card List，使用者上傳擴充派系資料，推測有擴充〔未驗證〕，要收牌庫請說一聲）②第一版（First Edition）卡表與 Remastered 的 Bidding Boards（各人數出價軌道每格最低出價）③捐贈卡 9 張、各物種板上的專屬規則文字、Faderan 遺跡世界的效果文字（只有公式）。
// 還沒做：①把公式字串轉成可顯示的中文或圖示 ②中文名稱核對 ③接進畫面。
// 資料量：物種牌庫 272 張，檔案不小；之後接進畫面時建議用動態 import，不要放進首頁 bundle。
//
// 來源不一致與待確認：
// 1. 難度順序：2020 規則書（經快速複習檔）把 Zeth 排在最後；Race Guide 與 ods 都給 Zeth 難度 3（Race Guide 另註「有任何新手就不要給」）。本檔照 Race Guide／ods 填 3，並在 summaryZh 註明。
// 2. 玩家輔助版本：快速複習檔引用 Player Aid v1.4，這次使用者上傳的是 v1.1；v1.1 沒有物種速查，所以物種摘要改以 Race Guide 為準。
// 3. 星河交匯與恆星匯流兩個中文名並存〔未決定〕。
// 4. 符號 O：Im’dril「Fleet Support」六張卡的費用（OOB→$ 等）與 Faderan「Gift of the Duruntai」的產出（➪OTgb+T）用了 O，但 ods Syntax 只說 O＝Im’dril Grand Fleet 的大軌道（擴充），基本版不該出現；依 Race Guide（Im’dril 需要八角、黑、棕）推測是八角塊 U 的筆誤，〔未驗證〕，已保留原字串。
// 5. Faderan 起始卡另標 NR、Caylion 的 1 Colony with x2：意義〔未驗證〕，照原字串保留。
// 6. 分享獎勵表（SIDEREAL_SHARING_BONUS）來自 ods Confluence 列，4～10 人、第 1～6 回合各剛好對應一筆（已用腳本驗證），但與實體匯流牌是否一致〔未驗證〕；3 人局只有擴充有。
// 7. Race Guide 的「需求資源」顏色來自表格裡的圖示，已用 Teaching Guide 的文字（Kt、Kjas 要黃，Faderan 要白，Caylion 缺飛船）與派系卡圖面交叉對過；擴充派系的需求用派系卡圖面，與同物種的基本派系相同（Deep Unity、Charity Syndicate 圖面沒標）。
// 8. 〔已解決〕匈牙利文版把 Faderan「Tudás tallér」（認可標記）寫成「遊戲結束時值 1 分」；官方英文派系說明寫「Worth 1 Point to you later」，且只在持有者發明科技、歸還標記時得 1 分，匈牙利文是譯誤，以英文為準。
// 9. Deep Unity 難度「2＊」、Caylion Collaborative 與 Yengii Jii 影響度的「＊」，來源只印星號、沒說明意義〔未驗證〕；本檔 difficulty 欄照 ods 填數字。
// 11. 西班牙文、德文玩家輔助提到「交易違約要罰分」（德文：每個方塊或飛船、每張卡或八角塊各扣若干分，數字在圖示裡看不清）；官方英文規則只寫「交易有約束力」，沒有罰分，不收〔未驗證，可能是玩家的房規〕。
// 12. 資源名稱的各語言對照（核對用）：綠＝西 Comida／德 Biomasse；白＝西 Cultura／德 Kulturgut；棕＝西 Industria／德 Industriegut；黑＝西 Información／德 Daten；藍＝西 Biotecnología／德 Biotechnologie；黃＝西 Energía／德 Energiecache（義大利文規則書寫 Power）；八角＝Ultratech。與快速複習檔的名稱對應一致。
// 10. Caylion 種子標記：Cheat Sheets 說是「轉換器跑兩次」，不是「產出翻倍」，只有轉換器需要投入時才有差別；Race Guide 寫「兩次」，一致。

import type { SiderealResKey, SiderealSpeciesKey } from './siderealConfluenceResources'

const SRC_SPECIES = 'Race Guide（難度、需求、提示）；ods Factions 工作表（殖民地支援、平手判定）；快速複習檔（核對）'
const SRC_FACTIONS = 'ods Factions 與 Bifurcation Card List 工作表（數字、起始庫存）；Factions.pdf、FactionsCards.pdf（特性、需求）；擴充是否擁有〔未驗證〕'

export type SiderealSpecies = {
  key: string
  speciesEn: string
  factionEn: string
  edition: 'base' | 'bifurcation'
  nicknameZh?: string
  difficulty: number
  colonySupport: number | '∞'
  tiebreaker: number | string
  needs?: SiderealResKey[]
  summaryZh?: string
  tipZh?: string
  startRaw?: string
  startExtra?: string
  src: string
}

// 9 個基本物種，順序＝規則書由易到難（Kt、Caylion、Kjas、Faderan、Im’dril、Eni Et、Unity、Yengii、Zeth）
export const SIDEREAL_SPECIES_BASE: SiderealSpecies[] = [
  { key: 'kt', speciesEn: 'Kt’Zr’Kt’Rtl', factionEn: 'Adhocracy', edition: 'base', nicknameZh: '毒販', difficulty: 1, colonySupport: '∞', tiebreaker: '∞', needs: ['green', 'yellow', 'ultratech'], summaryZh: '只缺綠色方塊，手上有很多便宜的殖民地可以賣（虛空驅動牌庫，打出費用 1～2 個黃）；殖民地支援無限；殖民地出價平手一律贏（視為殖民地比別人少），其他平手靠無限的平手判定值，但研究團隊出價沒有「殖民地比較少」的加成。', tipZh: '第一回合就要設法湊 5 個綠跑 Expansive Social Diffusion；缺綠時改收黃色，盡量多開虛空殖民地，長期是可觀的額外收入。虛空殖民地賣得比 1 個黃貴（例如 1 黃＋1 小方塊）就是白賺，而且在交易階段打出，可以馬上談成賣掉；有人要燒殖民地時，用「虛空殖民地＋小方塊或飛船」跟他換，之後拿到他本來要燒掉的殖民地產出。也可以把無限的殖民地支援「出租車位」。', src: SRC_SPECIES },
  { key: 'caylion', speciesEn: 'Caylion', factionEn: 'Plutocracy', edition: 'base', nicknameZh: '囤積者', difficulty: 2, colonySupport: 3, tiebreaker: 1, needs: ['green', 'black', 'blue', 'ship'], summaryZh: '幾乎什麼都不缺、只缺飛船，所以不給你方向；殖民地出價減半且不進位（1 艘只算 0.5，低於最低出價 1，拿不到牌），研究團隊出價不減半；種子標記讓殖民地的轉換器每個經濟階段跑兩次（升級殖民地的轉換器不翻倍，標記翻面後留在殖民地上、賣給別人也跟著走）。', tipZh: '前三回合每回合都要出 5 艘飛船標殖民地，所以要向別人收飛船；殖民地很值錢也很貴，早期賣價約產出的三倍，用一個殖民地換「叢林殖民地加一點資源」最划算（叢林殖民地可升級起始卡）；別拿自己標下的殖民地去升級起始卡；種子殖民地盡快升級，盡量挑升級後產同一種資源的殖民地，之後發明相關科技就很容易。起始卡裡有升級後產 1 分加黃色方塊的轉換器，因為在交易階段跑，黃色可以馬上賣掉。', src: SRC_SPECIES },
  { key: 'kjas', speciesEn: 'Kjasjavikalimm', factionEn: 'Directorate', edition: 'base', nicknameZh: '帝國暴君', difficulty: 2, colonySupport: 6, tiebreaker: 6, needs: ['brown', 'blue', 'yellow'], summaryZh: '經濟強、可以在遊戲中打造，能相對獨立於其他玩家；設置時在殖民地軌道上算兩位玩家；殖民地出價可拆成兩半各出一次（4 變 2＋2、5 變 3＋2），同回合不能再拆，兩次之間殖民地數量變多，平手判定也跟著變；有三塊領地板塊，用上方紫箭頭打出、下方紫箭頭升級。適合愛分析、解謎的玩家。', tipZh: '你需要非常多殖民地來打出與升級領地板塊：Kt’Zr’Kt’Rtl 是便宜殖民地的好來源，別的玩家也可能肯賣；沒把握立刻跑得起轉換器，就別打出或翻面板塊（燒殖民地換一塊不產出的板塊等於白丟）；遊戲結束前不需要把三塊都打出；拆出價可以用來卡別人殖民，或換經濟上的讓步。', src: SRC_SPECIES },
  { key: 'faderan', speciesEn: 'Faderan', factionEn: 'Conclave', edition: 'base', nicknameZh: '說客', difficulty: 3, colonySupport: 4, tiebreaker: 7, needs: ['green', 'brown', 'white'], summaryZh: '有「遺跡世界」隨機卡（每回合一次，花 4 個白色資源加一個冰殖民地抽一張；一張卡只有背面的一個轉換器，跑了才翻面），能力情境性強；認可標記：非 Faderan 玩家不能轉手，有人發明科技時歸還 1 個、Faderan 得 1 分（同回合發明多個科技，每個科技歸還一個）。適合喜歡驚喜、願意中途改變玩法的玩家；新手玩得開心，但不太容易贏。', tipZh: '前兩回合別花方塊請人收認可標記，經濟與遺跡世界更重要；中期給對方一個小或大方塊請他收，是合理價格，尤其在對方想發明的時候；最後一回合交易困難，認可標記可以當分數來付款；遺跡世界越早打越強，通常一局只會出 2～3 張，很少值得在最後兩回合才打；沒有冰殖民地可打遺跡世界時，把多餘的白色資源拿去跑 Ritual Government。', src: SRC_SPECIES },
  { key: 'imdril', speciesEn: 'Im’dril', factionEn: 'Nomads', edition: 'base', nicknameZh: '創業天才', difficulty: 4, colonySupport: 0, tiebreaker: 8, needs: ['brown', 'black', 'ultratech'], summaryZh: '經濟極強但脆弱，要細心照顧；需求明確（棕、黑、八角）卻幾乎吃不飽；沒有殖民地支援（可以出價，但得交易掉，否則經濟階段開始時要棄掉）；轉換器要有艦隊支援，艦隊用紫箭頭「發現」後進場並得 1 分，帶星號的艦隊起始就在場。適合熟手。', tipZh: '第一回合想跑 Galactic Exploration、Microgravity Assembly、Faderan Relic Caches 其中兩個，至少要先打出一張 2 點支援的艦隊；全部啟動要約 9 回合、但遊戲只有 6 回合，所以要大量向別人負債：這回合先拿資源、下回合加價還（經濟夠強，5 個小方塊換現在 1 個八角塊都付得起）；艦隊很貴，盡量在需要的最後一刻才打出；沒有殖民地，經濟一旦花光很難恢復，第 4 回合前先別發明科技。', src: SRC_SPECIES },
  { key: 'eniet', speciesEn: 'Eni Et', factionEn: 'Ascendancy', edition: 'base', nicknameZh: '避險基金經理', difficulty: 5, colonySupport: 3, tiebreaker: 3, needs: ['white', 'blue', 'ultratech'], summaryZh: '自己資源很少，但能讓別人變得很有錢；利息轉換器（投入同色方塊、產出更多同色方塊）自己不能跑，只能升級與借出；通用方塊投入利息轉換器不會消失，但轉換器不會多產出通用方塊。適合熟手、擅長讀別人狀況找機會的玩家。', tipZh: '看誰有足夠資源能跑你的利息轉換器就借給他，通常借出的價錢約為淨產出的一半；只差一點資源的人，可談三方交易把轉換器和資源一起送過去；Universal Applied Metaethics 是少數好用的得分轉換器（產出的白色是捐贈品，要再談回來）；利息轉換器可升級成產分，但那些分數收不回來，留到後期分數比資源值錢時再升級；找不到人借，就自己想辦法湊投入，請人幫跑只需一個小方塊；別讓同一個人長期用掉你大部分的轉換器，他會贏。', src: SRC_SPECIES },
  { key: 'unity', speciesEn: 'Unity', factionEn: 'Unity', edition: 'base', nicknameZh: '資源回收廠', difficulty: 5, colonySupport: 1, tiebreaker: 4, summaryZh: '通用資源：大通用方塊可當黑、藍、黃，小通用方塊可當綠、白、棕；大多數轉換器吃同大小的任何顏色、產出通用方塊，用不到的顏色拿來當投入。殖民地只能支援 1 張，但可用任何氣候的殖民地打出電腦世界、翻起始卡；Zeth 偷不到通用方塊。適合熟手、能談出「看起來有賺」交易的玩家。需求：任何資源。', tipZh: '別人的經濟階段是致富、交易階段是修正顏色；你相反，經濟階段才修正顏色，所以要在交易階段賺錢，利潤再小也要賺（一大換兩小、一小換一大）；讓別人知道你想要他們的「垃圾」；前三回合內打出約兩張電腦世界；你很少需要自己顧經濟，要主動找缺幾個方塊的玩家，在他們開口前先提供，收款可以下回合加價 50%；靠通用方塊躲 Zeth 通常不划算，買保護比較便宜。', src: SRC_SPECIES },
  { key: 'yengii', speciesEn: 'Yengii', factionEn: 'Society', edition: 'base', nicknameZh: '專利流氓', difficulty: 6, colonySupport: 3, tiebreaker: 5, summaryZh: '需要近乎神準地掌握場面與每個人的需求；適合很有經驗的玩家。科技不分享而是授權給個別玩家（可以在發明的同一個交易階段就授權），科技分享獎勵用自己專屬的較小數字；只有自己有效的研究團隊才算進研究團隊出價平手時的卡數；授權不能把被壓在別張卡下面的卡救回來。需求：每種資源都一樣需要。', tipZh: '第 2 回合左右發明 1～3 個科技：投入選場上充裕的資源，產出選別人普遍缺的、或能升級他們起始卡的；然後用最少的回合授權給最多的人，每項科技授權給至少 3 人、每人約 2 個小方塊就算做得不錯；也可以號召別人出資幫你發明（例如 4 人各給 2 個小方塊，換授權），像募資一樣；中期開始存資源、顧經濟，最後一回合發明幾個很貴的科技，並盡量多跑產分的轉換器。', src: SRC_SPECIES },
  { key: 'zeth', speciesEn: 'Zeth', factionEn: 'Anocracy', edition: 'base', nicknameZh: '保險業務員', difficulty: 3, colonySupport: 3, tiebreaker: 2, needs: ['white', 'black', 'yellow'], summaryZh: '不是在玩一樣的遊戲，而是在收保護費：與你交易過的人在下一次偷竊階段是安全的；每個偷竊轉換器只偷一個人，同一個人同回合不能被兩個偷竊轉換器偷；使節標記讓偷竊更便宜。Race Guide 難度標 3＊，新手多的局不要給。', tipZh: '理想情況是每回合每個人都付錢請你別偷，一個小方塊或等值利潤是不錯的起點；對不肯交易的人就真的去偷，偷他們最重視的東西，用你演出來的「無法抗拒的偷竊欲」讓人願意付錢；每個「Envoys」產出價值略高於 4 個小方塊，可以讓別人互相競標，沒人買就留著資源別跑；使節標記用完仍可跑 Envoys（只是不產標記）；強迫給出的捐贈品、你「Envoys」輸出的禮物都不算交易、不提供保護；多回合交易會每回合都給對方保護，開價時要算進去。', src: SRC_SPECIES },
]

// 9 個 Bifurcation 擴充派系（只收基本數字與起始庫存字串；startRaw 的數字寫法含糊，不解析）
export const SIDEREAL_SPECIES_BIFURCATION: SiderealSpecies[] = [
  { key: 'bif-caylion-collaborative', speciesEn: 'Caylion', factionEn: 'Caylion Collaborative', edition: 'bifurcation', difficulty: 3, colonySupport: 3, tiebreaker: 0, startRaw: 'TBggwwwbb***', startExtra: '1 Era 2 Research Team', needs: ['green', 'black', 'blue', 'ship'], summaryZh: '計畫（Project）卡要靠「票」才能啟動：別人各有 2 票、你只有 1 票；你把計畫卡借給別人換票，再依雙方協議分配計畫卡的產出。計畫卡不受 Eni Et 工程師服務標記與 Kt’Zr’Kt’Rtl Technophiles 回溯標記影響。適合想當全場焦點的新手（同桌有老手），或全桌最有魅力的老手。', tipZh: '買票時看計畫卡的產出，理想價格約一個小方塊；啟動計畫時要確保自己分到合理的利潤，並考慮票數與卡數的比例。', src: SRC_FACTIONS },
  { key: 'bif-eni-et-engineers', speciesEn: 'Eni Et', factionEn: 'Eni Et Engineers', edition: 'bifurcation', difficulty: 4, colonySupport: 3, tiebreaker: 1.5, startRaw: 'UTYw**½½', startExtra: '1 Colony', needs: ['white', 'blue', 'ultratech'], summaryZh: '產出「服務標記」，附在白色箭頭轉換器上，把它的投入減半（無條件進位）；殖民地與勝利點不算資源。適合觀察力強、會在桌上找最佳用途的玩家。', tipZh: '把服務標記換成「原本跑不動的轉換器」之後的長期分成，報酬比例照投入減少的幅度；剩餘回合越少，標記越不值錢；發明太慢時，可燒殖民地翻起始卡補經濟。', src: SRC_FACTIONS },
  { key: 'bif-society-of-falling-light', speciesEn: 'Faderan', factionEn: 'Society of Falling Light', edition: 'bifurcation', difficulty: 7, colonySupport: 8, tiebreaker: -1, startRaw: 'UYYBBTTgggwwwbb*', startExtra: '3 Colonies: Jungle, Water, Desert / 1 Research Team', needs: ['white', 'brown', 'green'], summaryZh: '不分享科技、也拿不到別人發明的科技，不領科技分享獎勵；研究團隊出價可拆成兩半；發明費用減半（進位）、得分減半（捨去）。發明過的團隊帶「後悔標記」，可成套交易換當下的分享獎勵，但終局每個 −1 分、不能再轉手；出價順序先看後悔標記少的人。難度極高，給非常熟的玩家。', tipZh: '把後悔標記平均分散，再把出價權拿去交易；常發明會互相升級、吃大方塊或八角的第二時代以上科技；把發明過的團隊連同部分投入一起賣，約每 1 點分享獎勵換 1 個小方塊。', src: SRC_FACTIONS },
  { key: 'bif-grand-fleet', speciesEn: 'Im’dril', factionEn: 'Grand Fleet', edition: 'bifurcation', difficulty: 5, colonySupport: 0, tiebreaker: 5.5, startRaw: 'UUYYTTTBB5g4w3b***', startExtra: '1 Research Team', needs: ['brown', 'black', 'ultratech'], summaryZh: '沒有殖民地支援（可以出價，但必須交易或消耗掉）；產出可自由交易的「軌道工廠」，永久附在殖民地上增產；艦隊支援只有起始的 5 點、不能再增加，所以經濟有天花板。適合能在後期湊出經濟的熟手。', tipZh: '成長空間有限：早點發明科技、盡量借別人的卡（最好長期借）、借出資源換下回合更高的報酬；軌道工廠的價值隨剩餘回合遞減，要和殖民地一起打包賣。', src: SRC_FACTIONS },
  { key: 'bif-kjasjavikalimm-independent-nations', speciesEn: 'Kjasjavikalimm', factionEn: 'Kjasjavikalimm Independent Nations', edition: 'bifurcation', difficulty: 4, colonySupport: 5, tiebreaker: 7.5, startRaw: '+YYBTbbwggg', startExtra: '2 Colonies / +Linguistic Analysis', needs: ['brown', 'blue', 'yellow'], summaryZh: '起始卡產的方塊全是「捐贈品」，自己也很需要別人的捐贈品與別人的科技；有兩張起始卡只收別人的捐贈品（顏色不拘），起始卡只能靠燒掉別人的科技升級（回合結束不歸還）。適合能快速交易、肯吃點虧讓資源流動的熟手。', tipZh: '交易階段先盡快收別人的捐贈品，必要時吃虧也沒關係；付費把自己的捐贈品洗成合法資源；幫別人發明會產出捐贈品的科技。', src: SRC_FACTIONS },
  { key: 'bif-kt-zr-kt-rtl-technophiles', speciesEn: 'Kt’Zr’Kt’Rtl', factionEn: 'Kt’Zr’Kt’Rtl Technophiles', edition: 'bifurcation', difficulty: 5, colonySupport: 3, tiebreaker: 10, startRaw: 'UYTBggb*', startExtra: '1 Colony / 1 Research Team', needs: ['green', 'yellow', 'ultratech'], summaryZh: '起始轉換器拆成兩張卡、各自升級；有一整副「Kit 研究團隊」牌，在交易階段用上面的紫箭頭徵召；自己發明這些科技要多付一個八角塊，別人不用；這些科技只要是你發明、或被分享／授權給你，就能拿來升級起始卡；Retrocontinuity 科技每個交易階段能把一個白色箭頭當紫色（Eni Et 利息與 Caylion 計畫除外），但同階段不能被消耗。', tipZh: '促成別人發明你的科技來升級自己的起始卡：提供團隊再加一點協助，收比最上面投入略多的代價；依各物種的弱點配科技。', src: SRC_FACTIONS },
  { key: 'bif-deep-unity', speciesEn: 'Unity', factionEn: 'Deep Unity', edition: 'bifurcation', difficulty: 2, colonySupport: 3, tiebreaker: 'π', startRaw: 'ATYBagwb**', startExtra: '1 Research Team / 3 Dice', summaryZh: '由骰子決定經濟：設置時與每回合匯流階段開始擲骰，決定在場的卡與領地板，永遠有 4 個經濟轉換器；雙骰翻面、三骰連起始卡一起翻面；骰子操控卡由消耗科技「種下」，可在交易階段重新指定。部分轉換器吃通用輸入、產出通用方塊。難度標 2＊，星號意義來源未標〔未驗證〕。適合想要明確短期目標、在當下交易的玩家。', tipZh: '產出大多等於投入，所以常用借來的方塊跑轉換器；用骰子操控讓供需更有彈性，切換成最合用的轉換器。', src: SRC_FACTIONS },
  { key: 'bif-yengii-jii', speciesEn: 'Yengii', factionEn: 'Yengii Jii', edition: 'bifurcation', difficulty: 4, colonySupport: 3, tiebreaker: 6.5, startRaw: 'BBYTbbgw*', startExtra: '1 Colony', needs: ['green', 'white', 'brown', 'black', 'blue', 'yellow', 'ultratech'], summaryZh: '把「Jii 限制」標記賣給別人，換 Yengii 專用的科技分享獎勵（每回合最多兩次，標記不可由別人轉手）：被限制的玩家與他借出的卡（Eni Et 利息與 Caylion 計畫除外）不能消耗該色資源，卻會多產出該色；每人最多持有 7 個限制（每色一個）；Jii 不能限制自己；Unity 通用方塊不能當被限制的色。影響度標 2＊，星號意義來源未標〔未驗證〕。需求：每種資源一樣需要。', tipZh: '前期限制多半有利（研究團隊的投入有選擇）；經濟成熟後限制的價值下降、副作用變大；把限制賣給經濟用不到該色的人換急需資源；訂長期協議，用自己的多餘資源去換對方被限制色的產出。', src: SRC_FACTIONS },
  { key: 'bif-charity-syndicate', speciesEn: 'Zeth', factionEn: 'Charity Syndicate', edition: 'bifurcation', difficulty: 5, colonySupport: 0, tiebreaker: 4.5, startRaw: 'YTBgwwbb**', startExtra: '1 Research Team', summaryZh: '別人手上有「不受歡迎者」卡，只有他們能升級、只有 Syndicate 能跑（有數量上限）；殖民地軌道少一個玩家；用「跨殖民」標記標在贏到的殖民地上：有人拿走那個殖民地就能升級自己的起始卡，對方棄掉它時 Syndicate 拿回標記並得 1 分。需求資源來源未標。', tipZh: '收費替自己或別人跑不受歡迎者；升級後的不受歡迎者可形成互惠的長期交易；誘導玩家拿你標記的殖民地，並在經濟階段開始時棄掉或賣給你。', src: SRC_FACTIONS },
]

export const SIDEREAL_SPECIES: SiderealSpecies[] = [...SIDEREAL_SPECIES_BASE, ...SIDEREAL_SPECIES_BIFURCATION]

// 物種牌庫（9 個基本物種）。cost：Starting＝起始就在場上；Researched＝有人發明對應科技後進場；
// 其他是打出所需的紫色轉換器（Kt 虛空驅動牌庫 Y→／YY→、Faderan 遺跡世界 wwwwI→R、Im’dril 艦隊支援、Unity 與 Kjas 的特殊牌）。
// front／back 是轉換器公式；up1、up2 是兩種升級方式（卡名＝前置卡，或一個紫色轉換器）；backName 是升級後的卡名。
export type SiderealSpeciesCard = {
  id: string
  species: SiderealSpeciesKey
  name: string
  era: number | null
  cost: string
  front?: string
  up1?: string
  up2?: string
  backName?: string
  back?: string
}

export const SIDEREAL_SPECIES_CARDS: SiderealSpeciesCard[] = [
  { id: 'caylion-nanotechnology', species: 'caylion', name: 'Nanotechnology', era: 1, cost: 'Researched', front: 'bbb➪Ug', up1: 'Genetic Engineering', up2: 'Atomic Transmutation', backName: 'Nanofabricators', back: 'bbb➪UgY' },
  { id: 'caylion-genetic-engineering', species: 'caylion', name: 'Genetic Engineering', era: 1, cost: 'Researched', front: 'ggg➪YBb', up1: 'Nanotechnology', up2: 'Clinical Immortality', backName: 'Genetic Resynthesis', back: 'ggg➪YBbY' },
  { id: 'caylion-universal-translator', species: 'caylion', name: 'Universal Translator', era: 1, cost: 'Researched', front: 'www➪$+B', up1: 'Ubiquitous Cultural Repository', up2: 'Quantum Computers', backName: 'Universal Empathic Communication', back: 'www➪$+Bbw' },
  { id: 'caylion-antimatter-power', species: 'caylion', name: 'Antimatter Power', era: 2, cost: 'Researched', front: 'bbbb➪YYBw', up1: 'Hyperspace Mining', up2: 'Organic Construction', backName: 'Antimatter Compounds', back: 'bbbb➪YYBwgw' },
  { id: 'caylion-interspecies-medical-exchange', species: 'caylion', name: 'Interspecies Medical Exchange', era: 2, cost: 'Researched', front: 'gggg➪$w+gb', up1: 'Cross Species Ethical Equality', up2: 'Organic Construction', backName: 'Panbiologic Medicine', back: 'gggg➪$wbY+gb' },
  { id: 'caylion-cross-species-ethical-equality', species: 'caylion', name: 'Cross Species Ethical Equality', era: 2, cost: 'Researched', front: 'wwww➪$+$b', up1: 'Interspecies Medical Exchange', up2: 'Achronal Analysis', backName: 'Concrete Universal Metaethics', back: 'wwww➪$U+$b' },
  { id: 'caylion-xeno-cultural-exchange', species: 'caylion', name: 'Xeno Cultural Exchange', era: 3, cost: 'Researched', front: 'bbbbb➪$Bwwwg+$', up1: 'Megastructures', up2: 'Social Exodus', backName: 'Multispecies Hybrid Cultures', back: 'bbbbb➪$$Bwwwg+$Bw' },
  { id: 'caylion-poly-species-corporations', species: 'caylion', name: 'Poly Species Corporations', era: 3, cost: 'Researched', front: 'ggggg➪$YY**+bbbg', up1: 'Galactic Telecomm Control', up2: 'Xeno Cultural Exchange', backName: 'Full Interspecies Integration', back: 'ggggg➪$$YY**+bbbgw' },
  { id: 'caylion-social-exodus', species: 'caylion', name: 'Social Exodus', era: 3, cost: 'Researched', front: 'wwwww➪$**B+$**YT', up1: 'Galactic Telecomm Control', up2: 'Xeno Cultural Exchange', backName: 'Galactic Colonization', back: 'wwwww➪$$**B+$**YTb' },
  { id: 'caylion-quantum-computers', species: 'caylion', name: 'Quantum Computers', era: 1, cost: 'Researched', front: 'BB➪TYg', up1: 'Universal Translator', up2: 'Clinical Immortality', backName: 'Nondeterministic Polynomial Collapse', back: 'BB➪YTgY' },
  { id: 'caylion-clinical-immortality', species: 'caylion', name: 'Clinical Immortality', era: 1, cost: 'Researched', front: 'TT➪$w', up1: 'Genetic Engineering', up2: 'Atomic Transmutation', backName: 'Practical Immortality', back: 'TT➪$wY' },
  { id: 'caylion-ubiquitous-cultural-repository', species: 'caylion', name: 'Ubiquitous Cultural Repository', era: 1, cost: 'Researched', front: 'YY➪$g', up1: 'Universal Translator', up2: 'Quantum Computers', backName: 'Memetic Lifeforms', back: 'YY➪$gB' },
  { id: 'caylion-achronal-analysis', species: 'caylion', name: 'Achronal Analysis', era: 2, cost: 'Researched', front: 'BBB➪UYwb', up1: 'Antimatter Power', up2: 'Singularity Control', backName: 'Time Viewers', back: 'BBB➪UYTwwb' },
  { id: 'caylion-organic-construction', species: 'caylion', name: 'Organic Construction', era: 2, cost: 'Researched', front: 'TTT➪**bbwg', up1: 'Interspecies Medical Exchange', up2: 'Cross Species Ethical Equality', backName: 'Living Infrastructure', back: 'TTT➪Y**bbwg' },
  { id: 'caylion-hyperspace-mining', species: 'caylion', name: 'Hyperspace Mining', era: 2, cost: 'Researched', front: 'YYY➪UB+YY', up1: 'Antimatter Power', up2: 'Singularity Control', backName: 'Hyperspace Settlements', back: 'YYY➪UBBwb+YY' },
  { id: 'caylion-galactic-telecomm-control', species: 'caylion', name: 'Galactic Telecomm Control', era: 3, cost: 'Researched', front: 'BBBB➪$$$bbw', up1: 'Poly Species Corporations', up2: 'Social Exodus', backName: 'Galactic Domination', back: 'BBBB➪$$$$Ybbw' },
  { id: 'caylion-temporal-dilation', species: 'caylion', name: 'Temporal Dilation', era: 3, cost: 'Researched', front: 'TTTT➪$$Uggw', up1: 'Megastructures', up2: 'Matter Generation', backName: 'Stasis Field', back: 'TTTT➪$$$Uggw+U' },
  { id: 'caylion-matter-generation', species: 'caylion', name: 'Matter Generation', era: 3, cost: 'Researched', front: 'YYYY➪$$UTwb', up1: 'Poly Species Corporations', up2: 'Temporal Dilation', backName: 'Macroscale Teleportation', back: 'YYYY➪$$$UTwbb' },
  { id: 'caylion-lunar-mining-consortium', species: 'caylion', name: 'Lunar Mining Consortium', era: 0, cost: 'Starting', front: 'TT➪**Bw', up1: 'BBJ→$Y', up2: 'Organic Construction', backName: 'Auxonic Outersystem Harvesting', back: 'TT➪**BYg' },
  { id: 'caylion-planetary-ecological-dominance', species: 'caylion', name: 'Planetary Ecological Dominance', era: 0, cost: 'Starting', front: '➪gggw*', up1: 'TTJ→$Y', up2: 'Genetic Engineering', backName: 'Systemwide Gravitic Dominance', back: '➪gggwT*' },
  { id: 'caylion-atomic-transmutation', species: 'caylion', name: 'Atomic Transmutation', era: 1, cost: 'Researched', front: 'U➪YTb', up1: 'Ubiquitous Cultural Repository', up2: 'Nanotechnology', backName: 'Pseudomaterials', back: 'U➪YTbT' },
  { id: 'caylion-oceanic-processing', species: 'caylion', name: 'Oceanic Processing', era: 0, cost: 'Starting', front: 'gg➪Tb', up1: 'BBJ→$Y', up2: 'Antimatter Power', backName: 'Planet-wide Industrial Mariculture', back: 'gg➪BTb' },
  { id: 'caylion-distributed-telenet', species: 'caylion', name: 'Distributed Telenet', era: 0, cost: 'Starting', front: 'B➪bw', up1: 'TTJ→$Y', up2: 'Ubiquitous Cultural Repository', backName: 'Ansible Driven Intersystem Society', back: 'B➪Tbw' },
  { id: 'caylion-singularity-control', species: 'caylion', name: 'Singularity Control', era: 2, cost: 'Researched', front: 'UU➪YTTwgb*', up1: 'Hyperspace Mining', up2: 'Achronal Analysis', backName: 'Wormhole Grid', back: 'UU➪YTTwbbbg*' },
  { id: 'caylion-megastructures', species: 'caylion', name: 'Megastructures', era: 3, cost: 'Researched', front: 'UUU➪$$$$$wb', up1: 'Temporal Dilation', up2: 'Matter Generation', backName: 'Dyson Swarms', back: 'UUU➪$$$$$$wbT' },
  { id: 'eniet-nanotechnology', species: 'eniet', name: 'Nanotechnology', era: 1, cost: 'Researched', front: 'bbb➪Uw', up1: 'Genetic Engineering', up2: 'Atomic Transmutation', backName: 'Nanofabricators', back: 'bbb➪UwT' },
  { id: 'eniet-genetic-engineering', species: 'eniet', name: 'Genetic Engineering', era: 1, cost: 'Researched', front: 'ggg➪YBb', up1: 'Nanotechnology', up2: 'Clinical Immortality', backName: 'Genetic Resynthesis', back: 'ggg➪YBbB' },
  { id: 'eniet-universal-translator', species: 'eniet', name: 'Universal Translator', era: 1, cost: 'Researched', front: 'www➪$+B', up1: 'Ubiquitous Cultural Repository', up2: 'Quantum Computers', backName: 'Universal Empathic Communication', back: 'www➪$+Bgb' },
  { id: 'eniet-antimatter-power', species: 'eniet', name: 'Antimatter Power', era: 2, cost: 'Researched', front: 'bbbb➪YYBw', up1: 'Hyperspace Mining', up2: 'Organic Construction', backName: 'Antimatter Compounds', back: 'bbbb➪YYBwgg' },
  { id: 'eniet-interspecies-medical-exchange', species: 'eniet', name: 'Interspecies Medical Exchange', era: 2, cost: 'Researched', front: 'gggg➪$w+gb', up1: 'Cross Species Ethical Equality', up2: 'Organic Construction', backName: 'Panbiologic Medicine', back: 'gggg➪$wbY+gb' },
  { id: 'eniet-cross-species-ethical-equality', species: 'eniet', name: 'Cross Species Ethical Equality', era: 2, cost: 'Researched', front: 'wwww➪$+$b', up1: 'Interspecies Medical Exchange', up2: 'Achronal Analysis', backName: 'Concrete Universal Metaethics', back: 'wwww➪$U+$b' },
  { id: 'eniet-xeno-cultural-exchange', species: 'eniet', name: 'Xeno Cultural Exchange', era: 3, cost: 'Researched', front: 'bbbbb➪$Ywwgg+$', up1: 'Megastructures', up2: 'Social Exodus', backName: 'Multispecies Hybrid Cultures', back: 'bbbbb➪$$Ywwgg+$Yg' },
  { id: 'eniet-poly-species-corporations', species: 'eniet', name: 'Poly Species Corporations', era: 3, cost: 'Researched', front: 'ggggg➪$YT**+bbgg', up1: 'Galactic Telecomm Control', up2: 'Xeno Cultural Exchange', backName: 'Full Interspecies Integration', back: 'ggggg➪$$YT**+bbbgg' },
  { id: 'eniet-social-exodus', species: 'eniet', name: 'Social Exodus', era: 3, cost: 'Researched', front: 'wwwww➪$**B+$**YB', up1: 'Galactic Telecomm Control', up2: 'Xeno Cultural Exchange', backName: 'Galactic Colonization', back: 'wwwww➪$$**B+$**YBb' },
  { id: 'eniet-quantum-computers', species: 'eniet', name: 'Quantum Computers', era: 1, cost: 'Researched', front: 'BB➪YYg', up1: 'Universal Translator', up2: 'Clinical Immortality', backName: 'Nondeterministic Polynomial Collapse', back: 'BB➪YYgY' },
  { id: 'eniet-clinical-immortality', species: 'eniet', name: 'Clinical Immortality', era: 1, cost: 'Researched', front: 'TT➪$b', up1: 'Genetic Engineering', up2: 'Atomic Transmutation', backName: 'Practical Immortality', back: 'TT➪$bB' },
  { id: 'eniet-ubiquitous-cultural-repository', species: 'eniet', name: 'Ubiquitous Cultural Repository', era: 1, cost: 'Researched', front: 'YY➪$g', up1: 'Universal Translator', up2: 'Quantum Computers', backName: 'Memetic Lifeforms', back: 'YY➪$gB' },
  { id: 'eniet-achronal-analysis', species: 'eniet', name: 'Achronal Analysis', era: 2, cost: 'Researched', front: 'BBB➪UYwb', up1: 'Antimatter Power', up2: 'Singularity Control', backName: 'Time Viewers', back: 'BBB➪UYwbbY' },
  { id: 'eniet-organic-construction', species: 'eniet', name: 'Organic Construction', era: 2, cost: 'Researched', front: 'TTT➪**bbgg', up1: 'Interspecies Medical Exchange', up2: 'Cross Species Ethical Equality', backName: 'Living Infrastructure', back: 'TTT➪**bbggB' },
  { id: 'eniet-hyperspace-mining', species: 'eniet', name: 'Hyperspace Mining', era: 2, cost: 'Researched', front: 'YYY➪UB+BT', up1: 'Antimatter Power', up2: 'Singularity Control', backName: 'Hyperspace Settlements', back: 'YYY➪UBBgb+BT' },
  { id: 'eniet-galactic-telecomm-control', species: 'eniet', name: 'Galactic Telecomm Control', era: 3, cost: 'Researched', front: 'BBBB➪$$$bgw', up1: 'Poly Species Corporations', up2: 'Social Exodus', backName: 'Galactic Domination', back: 'BBBB➪$$$$Tbgw' },
  { id: 'eniet-temporal-dilation', species: 'eniet', name: 'Temporal Dilation', era: 3, cost: 'Researched', front: 'TTTT➪$$Ugbb', up1: 'Megastructures', up2: 'Matter Generation', backName: 'Stasis Field', back: 'TTTT➪$$$Ugbb+U' },
  { id: 'eniet-matter-generation', species: 'eniet', name: 'Matter Generation', era: 3, cost: 'Researched', front: 'YYYY➪$$UBwb', up1: 'Poly Species Corporations', up2: 'Temporal Dilation', backName: 'Macroscale Teleportation', back: 'YYYY➪$$$UBwgb' },
  { id: 'eniet-bone-carving', species: 'eniet', name: 'Bone Carving', era: 0, cost: 'Starting', front: 'TT➪wwbg', up1: 'TTW→$', up2: 'Nanotechnology', backName: 'Nanocraft', back: 'TT➪wwwbg' },
  { id: 'eniet-deep-hunting', species: 'eniet', name: 'Deep Hunting', era: 0, cost: 'Starting', front: '➪T*', up1: 'TTW→$', up2: 'Genetic Engineering', backName: 'Pelagic Bounty', back: '➪T*w' },
  { id: 'eniet-atomic-transmutation', species: 'eniet', name: 'Atomic Transmutation', era: 1, cost: 'Researched', front: 'U➪BTb', up1: 'Ubiquitous Cultural Repository', up2: 'Nanotechnology', backName: 'Pseudomaterials', back: 'U➪YBTb' },
  { id: 'eniet-choral-song', species: 'eniet', name: 'Choral Song', era: 0, cost: 'Starting', front: 'wwwww➪UBg**', up1: 'TTW→$', up2: 'Clinical Immortality', backName: 'Eternal Music', back: 'wwwww➪UBg**Y' },
  { id: 'eniet-universal-applied-metaethics', species: 'eniet', name: 'Universal Applied Metaethics', era: 0, cost: 'Starting', front: 'U➪$+www', up1: 'TTW→$', up2: 'Atomic Transmutation', backName: 'Omnispecies Metaethical Models', back: 'U➪$+wwwgb' },
  { id: 'eniet-singularity-control', species: 'eniet', name: 'Singularity Control', era: 2, cost: 'Researched', front: 'UU➪TBYggb*', up1: 'Hyperspace Mining', up2: 'Achronal Analysis', backName: 'Wormhole Grid', back: 'UU➪YBTggbbw*' },
  { id: 'eniet-megastructures', species: 'eniet', name: 'Megastructures', era: 3, cost: 'Researched', front: 'UUU➪$$$$$gb', up1: 'Temporal Dilation', up2: 'Matter Generation', backName: 'Dyson Swarms', back: 'UUU➪$$$$$$gbB' },
  { id: 'eniet-cultural-charity', species: 'eniet', name: 'Cultural Charity', era: 0, cost: 'Starting', front: 's8➪s13', up1: 'Cross Species Ethical Equality', up2: 'Antimatter Power', backName: 'Omnicultural Dynamic Charity', back: 'ssssssss➪sssssss$$$' },
  { id: 'eniet-volunteer-medical-movement', species: 'eniet', name: 'Volunteer Medical Movement', era: 0, cost: 'Starting', front: 's6➪s9', up1: 'Interspecies Medical Exchange', up2: 'Organic Construction', backName: 'Universal Health', back: 'ssssss➪sssss$$' },
  { id: 'eniet-mutual-understanding', species: 'eniet', name: 'Mutual Understanding', era: 0, cost: 'Starting', front: 's2➪s4', up1: 'Quantum Computers', up2: 'Universal Translator', backName: 'Interspecies Empathy', back: 'ss➪sss$' },
  { id: 'eniet-elder-s-wisdom', species: 'eniet', name: 'Elder\'s Wisdom', era: 0, cost: 'Starting', front: 'L6➪L10', up1: 'Quantum Computers', up2: 'Clinical Immortality', backName: 'Immortal’s Wisdom', back: 'LLLLLL➪LLLLLLL$$' },
  { id: 'eniet-intercultural-archive', species: 'eniet', name: 'Intercultural Archive', era: 0, cost: 'Starting', front: 'L3➪L4', up1: 'Ubiquitous Cultural Repository', up2: 'Universal Translator', backName: 'Ubiquitous Cultural Influence', back: 'LLL➪LLL$' },
  { id: 'eniet-xenotech-pool', species: 'eniet', name: 'Xenotech Pool', era: 0, cost: 'Starting', front: 'U3➪U5', up1: 'Hyperspace Mining', up2: 'Singularity Control', backName: 'Ultratech Community', back: 'UUU➪UUU$$$' },
  { id: 'faderan-gift-of-the-duruntai', species: 'faderan', name: 'Gift of the Duruntai', era: 1, cost: 'wwwwI→R', front: '➪OTgb+T' },
  { id: 'faderan-contextual-integrator-cache', species: 'faderan', name: 'Contextual Integrator Cache', era: 1, cost: 'wwwwI→R', front: 'Variable $,Ack* upgraded' },
  { id: 'faderan-automated-transport-network', species: 'faderan', name: 'Automated Transport Network', era: 1, cost: 'wwwwI→R', front: '➪g,+2 colonies from deck' },
  { id: 'faderan-relic-detector', species: 'faderan', name: 'Relic Detector', era: 1, cost: 'wwwwI→R', front: 'gggN→R' },
  { id: 'faderan-library-of-entelechy', species: 'faderan', name: 'Library of Entelechy', era: 1, cost: 'wwwwI→R', front: '➪+$Bgw' },
  { id: 'faderan-transmutive-decomposer', species: 'faderan', name: 'Transmutive Decomposer', era: 1, cost: 'wwwwI→R', front: '$,**➪UbgY' },
  { id: 'faderan-nalgorian-grindstone', species: 'faderan', name: 'Nalgorian Grindstone', era: 1, cost: 'wwwwI→R', front: '$➪TBbg' },
  { id: 'faderan-star-s-ruin', species: 'faderan', name: 'Star\'s Ruin', era: 1, cost: 'wwwwI→R', front: '$$X' },
  { id: 'faderan-paradise-converter', species: 'faderan', name: 'Paradise Converter', era: 1, cost: 'wwwwI→R', front: 'TB,N➾$$' },
  { id: 'faderan-barian-trade-armada', species: 'faderan', name: 'Barian Trade Armada', era: 1, cost: 'wwwwI→R', front: '$UTBYgbw****' },
  { id: 'faderan-thil-s-demiring', species: 'faderan', name: 'Thil\'s Demiring', era: 1, cost: 'wwwwI→R', front: 'gbw, YB➪$$' },
  { id: 'faderan-the-grand-armilla', species: 'faderan', name: 'The Grand Armilla', era: 1, cost: 'wwwwI→R', front: '$,➪****' },
  { id: 'faderan-nanotechnology', species: 'faderan', name: 'Nanotechnology', era: 1, cost: 'Researched', front: 'bbb➪Ug', up1: 'Genetic Engineering', up2: 'Atomic Transmutation', backName: 'Nanofabricators', back: 'bbb➪UgY' },
  { id: 'faderan-genetic-engineering', species: 'faderan', name: 'Genetic Engineering', era: 1, cost: 'Researched', front: 'ggg➪BTw', up1: 'Nanotechnology', up2: 'Clinical Immortality', backName: 'Genetic Resynthesis', back: 'ggg➪BTwT' },
  { id: 'faderan-universal-translator', species: 'faderan', name: 'Universal Translator', era: 1, cost: 'Researched', front: 'www➪$+B', up1: 'Ubiquitous Cultural Repository', up2: 'Quantum Computers', backName: 'Universal Empathic Communication', back: 'www➪$+Bbw' },
  { id: 'faderan-antimatter-power', species: 'faderan', name: 'Antimatter Power', era: 2, cost: 'Researched', front: 'bbbb➪YYTg', up1: 'Hyperspace Mining', up2: 'Organic Construction', backName: 'Antimatter Compounds', back: 'bbbb➪YYTggw' },
  { id: 'faderan-interspecies-medical-exchange', species: 'faderan', name: 'Interspecies Medical Exchange', era: 2, cost: 'Researched', front: 'gggg➪$b+gg', up1: 'Cross Species Ethical Equality', up2: 'Organic Construction', backName: 'Panbiologic Medicine', back: 'gggg➪$bwT+gg' },
  { id: 'faderan-cross-species-ethical-equality', species: 'faderan', name: 'Cross Species Ethical Equality', era: 2, cost: 'Researched', front: 'wwww➪$+$w', up1: 'Interspecies Medical Exchange', up2: 'Achronal Analysis', backName: 'Concrete Universal Metaethics', back: 'wwww➪$U+$w' },
  { id: 'faderan-xeno-cultural-exchange', species: 'faderan', name: 'Xeno Cultural Exchange', era: 3, cost: 'Researched', front: 'bbbbb➪$Bwwgg+$', up1: 'Megastructures', up2: 'Social Exodus', backName: 'Multispecies Hybrid Cultures', back: 'bbbbb➪$$Bwwgg+$Tw' },
  { id: 'faderan-poly-species-corporations', species: 'faderan', name: 'Poly Species Corporations', era: 3, cost: 'Researched', front: 'ggggg➪$YB**+bbgw', up1: 'Galactic Telecomm Control', up2: 'Xeno Cultural Exchange', backName: 'Full Interspecies Integration', back: 'ggggg➪$$YB**+bbgww' },
  { id: 'faderan-social-exodus', species: 'faderan', name: 'Social Exodus', era: 3, cost: 'Researched', front: 'wwwww➪$**Y+$**YT', up1: 'Galactic Telecomm Control', up2: 'Xeno Cultural Exchange', backName: 'Galactic Colonization', back: 'wwwww➪$$**Y+$**YgT' },
  { id: 'faderan-quantum-computers', species: 'faderan', name: 'Quantum Computers', era: 1, cost: 'Researched', front: 'BB➪TYb', up1: 'Universal Translator', up2: 'Clinical Immortality', backName: 'Nondeterministic Polynomial Collapse', back: 'BB➪TYbY' },
  { id: 'faderan-clinical-immortality', species: 'faderan', name: 'Clinical Immortality', era: 1, cost: 'Researched', front: 'TT➪$g', up1: 'Genetic Engineering', up2: 'Atomic Transmutation', backName: 'Practical Immortality', back: 'TT➪$gB' },
  { id: 'faderan-ubiquitous-cultural-repository', species: 'faderan', name: 'Ubiquitous Cultural Repository', era: 1, cost: 'Researched', front: 'YY➪$w', up1: 'Universal Translator', up2: 'Quantum Computers', backName: 'Memetic Lifeforms', back: 'YY➪$wB' },
  { id: 'faderan-achronal-analysis', species: 'faderan', name: 'Achronal Analysis', era: 2, cost: 'Researched', front: 'BBB➪UTwb', up1: 'Antimatter Power', up2: 'Singularity Control', backName: 'Time Viewers', back: 'BBB➪UTwbwY' },
  { id: 'faderan-organic-construction', species: 'faderan', name: 'Organic Construction', era: 2, cost: 'Researched', front: 'TTT➪**bbwg', up1: 'Interspecies Medical Exchange', up2: 'Cross Species Ethical Equality', backName: 'Living Infrastructure', back: 'TTT➪**bbwgY' },
  { id: 'faderan-hyperspace-mining', species: 'faderan', name: 'Hyperspace Mining', era: 2, cost: 'Researched', front: 'YYY➪UB+BT', up1: 'Antimatter Power', up2: 'Singularity Control', backName: 'Hyperspace Settlements', back: 'YYY➪UBBbb+BT' },
  { id: 'faderan-galactic-telecomm-control', species: 'faderan', name: 'Galactic Telecomm Control', era: 3, cost: 'Researched', front: 'BBBB➪$$$wwg', up1: 'Poly Species Corporations', up2: 'Social Exodus', backName: 'Galactic Domination', back: 'BBBB➪$$$$Ywwg' },
  { id: 'faderan-temporal-dilation', species: 'faderan', name: 'Temporal Dilation', era: 3, cost: 'Researched', front: 'TTTT➪$$Ubbg', up1: 'Megastructures', up2: 'Matter Generation', backName: 'Stasis Field', back: 'TTTT➪$$$Ubbg+U' },
  { id: 'faderan-matter-generation', species: 'faderan', name: 'Matter Generation', era: 3, cost: 'Researched', front: 'YYYY➪$$UTgb', up1: 'Poly Species Corporations', up2: 'Temporal Dilation', backName: 'Macroscale Teleportation', back: 'YYYY➪$$$UTgbb' },
  { id: 'faderan-relic-repurposing', species: 'faderan', name: 'Relic Repurposing', era: 0, cost: 'Starting', front: 'bb➪**w', up1: 'Achronal Analysis', up2: 'Antimatter Power', backName: 'Relic Manufacturing', back: 'bb➪**wwg' },
  { id: 'faderan-archaic-automated-support-network', species: 'faderan', name: 'Archaic Automated Support Network', era: 0, cost: 'Starting', front: '➪wgb*', up1: 'Singularity Control', up2: 'Hyperspace Mining', backName: 'Domesticated Automated Support Network', back: '➪wgb*+BY' },
  { id: 'faderan-atomic-transmutation', species: 'faderan', name: 'Atomic Transmutation', era: 1, cost: 'Researched', front: 'U➪YTb', up1: 'Ubiquitous Cultural Repository', up2: 'Nanotechnology', backName: 'Pseudomaterials', back: 'U➪YTbT' },
  { id: 'faderan-ritual-government', species: 'faderan', name: 'Ritual Government', era: 0, cost: 'Starting', front: 'wwww➪UBg', up1: 'Cross Species Ethical Equality', up2: 'Interspecies Medical Exchange', backName: 'Interspecies Capital', back: 'wwww➪UBg+$' },
  { id: 'faderan-non-indigenous-fauna', species: 'faderan', name: 'Non-Indigenous Fauna', era: 0, cost: 'Starting', front: 'ggg➪YTb', up1: 'Genetic Engineering', up2: 'Clinical Immortality', backName: 'Genetically Pliable Fauna', back: 'ggg➪YTTb' },
  { id: 'faderan-singularity-control', species: 'faderan', name: 'Singularity Control', era: 2, cost: 'Researched', front: 'UU➪TBBgwb*', up1: 'Hyperspace Mining', up2: 'Achronal Analysis', backName: 'Wormhole Grid', back: 'UU➪TBBgwb*gg' },
  { id: 'faderan-megastructures', species: 'faderan', name: 'Megastructures', era: 3, cost: 'Researched', front: 'UUU➪$$$$$wb', up1: 'Temporal Dilation', up2: 'Matter Generation', backName: 'Dyson Swarms', back: 'UUU➪$$$$$$wbB' },
  { id: 'imdril-nanotechnology', species: 'imdril', name: 'Nanotechnology', era: 1, cost: 'Researched', front: 'bbbF➪Ug', up1: 'Genetic Engineering', up2: 'Atomic Transmutation', backName: 'Nanofabricators', back: 'bbbF➪UgY' },
  { id: 'imdril-genetic-engineering', species: 'imdril', name: 'Genetic Engineering', era: 1, cost: 'Researched', front: 'gggF➪YTw', up1: 'Nanotechnology', up2: 'Clinical Immortality', backName: 'Genetic Resynthesis', back: 'gggF➪YTwT' },
  { id: 'imdril-universal-translator', species: 'imdril', name: 'Universal Translator', era: 1, cost: 'Researched', front: 'wwwF➪$+T', up1: 'Ubiquitous Cultural Repository', up2: 'Quantum Computers', backName: 'Universal Empathic Communication', back: 'wwwF➪$+Twg' },
  { id: 'imdril-antimatter-power', species: 'imdril', name: 'Antimatter Power', era: 2, cost: 'Researched', front: 'bbbbF➪YYBg', up1: 'Hyperspace Mining', up2: 'Organic Construction', backName: 'Antimatter Compounds', back: 'bbbbF➪YYBggw' },
  { id: 'imdril-interspecies-medical-exchange', species: 'imdril', name: 'Interspecies Medical Exchange', era: 2, cost: 'Researched', front: 'ggggF➪$w+wg', up1: 'Cross Species Ethical Equality', up2: 'Organic Construction', backName: 'Panbiologic Medicine', back: 'ggggF➪$wwT+wg' },
  { id: 'imdril-cross-species-ethical-equality', species: 'imdril', name: 'Cross Species Ethical Equality', era: 2, cost: 'Researched', front: 'wwwwF➪$+$w', up1: 'Interspecies Medical Exchange', up2: 'Achronal Analysis', backName: 'Concrete Universal Metaethics', back: 'wwwwF➪$U+$w' },
  { id: 'imdril-xeno-cultural-exchange', species: 'imdril', name: 'Xeno Cultural Exchange', era: 3, cost: 'Researched', front: 'bbbbbF➪$Bwwgg+$', up1: 'Megastructures', up2: 'Social Exodus', backName: 'Multispecies Hybrid Cultures', back: 'bbbbbF➪$$Bwwgg+$Bw' },
  { id: 'imdril-poly-species-corporations', species: 'imdril', name: 'Poly Species Corporations', era: 3, cost: 'Researched', front: 'gggggF➪$YT**+wwgb', up1: 'Galactic Telecomm Control', up2: 'Xeno Cultural Exchange', backName: 'Full Interspecies Integration', back: 'gggggF➪$$YT**+wwwgb' },
  { id: 'imdril-social-exodus', species: 'imdril', name: 'Social Exodus', era: 3, cost: 'Researched', front: 'wwwwwF➪$**Y+$**YT', up1: 'Galactic Telecomm Control', up2: 'Xeno Cultural Exchange', backName: 'Galactic Reunion', back: 'wwwwwF➪$$**Y+$**YTb' },
  { id: 'imdril-quantum-computers', species: 'imdril', name: 'Quantum Computers', era: 1, cost: 'Researched', front: 'BBF➪TYb', up1: 'Universal Translator', up2: 'Clinical Immortality', backName: 'Nondeterministic Polynomial Collapse', back: 'BBF➪TYbT' },
  { id: 'imdril-clinical-immortality', species: 'imdril', name: 'Clinical Immortality', era: 1, cost: 'Researched', front: 'TTF➪$w', up1: 'Genetic Engineering', up2: 'Atomic Transmutation', backName: 'Practical Immortality', back: 'TTF➪$wY' },
  { id: 'imdril-ubiquitous-cultural-repository', species: 'imdril', name: 'Ubiquitous Cultural Repository', era: 1, cost: 'Researched', front: 'YYF➪$w', up1: 'Universal Translator', up2: 'Quantum Computers', backName: 'Memetic Lifeforms', back: 'YYF➪$wB' },
  { id: 'imdril-achronal-analysis', species: 'imdril', name: 'Achronal Analysis', era: 2, cost: 'Researched', front: 'BBBF➪UTwg', up1: 'Antimatter Power', up2: 'Singularity Control', backName: 'Time Viewers', back: 'BBBF➪UTwggT' },
  { id: 'imdril-organic-construction', species: 'imdril', name: 'Organic Construction', era: 2, cost: 'Researched', front: 'TTTF➪**wbgg', up1: 'Interspecies Medical Exchange', up2: 'Cross Species Ethical Equality', backName: 'Living Infrastructure', back: 'TTTF➪**wbggY' },
  { id: 'imdril-hyperspace-mining', species: 'imdril', name: 'Hyperspace Mining', era: 2, cost: 'Researched', front: 'YYYF➪UT+YT', up1: 'Antimatter Power', up2: 'Singularity Control', backName: 'Hyperspace Settlements', back: 'YYYF➪UTYgb+YT' },
  { id: 'imdril-galactic-telecomm-control', species: 'imdril', name: 'Galactic Telecomm Control', era: 3, cost: 'Researched', front: 'BBBBF➪$$$gwb', up1: 'Poly Species Corporations', up2: 'Social Exodus', backName: 'Galactic Domination', back: 'BBBBF➪$$$$Ygwb' },
  { id: 'imdril-temporal-dilation', species: 'imdril', name: 'Temporal Dilation', era: 3, cost: 'Researched', front: 'TTTTF➪$$Uwgg', up1: 'Megastructures', up2: 'Matter Generation', backName: 'Stasis Field', back: 'TTTTF➪$$$Uwgg+U' },
  { id: 'imdril-matter-generation', species: 'imdril', name: 'Matter Generation', era: 3, cost: 'Researched', front: 'YYYYF➪$$UTwb', up1: 'Poly Species Corporations', up2: 'Temporal Dilation', backName: 'Macroscale Teleportation', back: 'YYYYF➪$$$UTwbb' },
  { id: 'imdril-galactic-exploration', species: 'imdril', name: 'Galactic Exploration', era: 0, cost: 'Starting', front: 'BBFF➪UTgww', up1: 'Achronal Analysis', up2: 'Hyperspace Mining', backName: 'Galactic Windfall Cartography', back: 'BBF➪UTgwwY' },
  { id: 'imdril-asteroid-mining', species: 'imdril', name: 'Asteroid Mining', era: 0, cost: 'Starting', front: 'FF➪*bb', up1: 'Antimatter Power', up2: 'Hyperspace Mining', backName: 'Asteroid Construction Yards', back: 'F➪*bb,Y➪Tg §' },
  { id: 'imdril-atomic-transmutation', species: 'imdril', name: 'Atomic Transmutation', era: 1, cost: 'Researched', front: 'UF➪YBg', up1: 'Ubiquitous Cultural Repository', up2: 'Nanotechnology', backName: 'Pseudomaterials', back: 'UF➪YBgY' },
  { id: 'imdril-microgravity-assembly', species: 'imdril', name: 'Microgravity Assembly', era: 0, cost: 'Starting', front: 'bbbbFF➪YYBT****', up1: 'Nanotechnology', up2: 'Quantum Computers', backName: 'Distributed Manufacturing', back: 'bbbbF➪YYBT****' },
  { id: 'imdril-faderan-relic-caches', species: 'imdril', name: 'Faderan Relic Caches', era: 0, cost: 'Starting', front: 'UUFF➪TTBYYggbw', up1: 'Atomic Transmutation', up2: 'Clinical Immortality', backName: 'Relic Resynthesis', back: 'UUF➪TTBYYggbbw' },
  { id: 'imdril-singularity-control', species: 'imdril', name: 'Singularity Control', era: 2, cost: 'Researched', front: 'UUF➪TBYgbb*', up1: 'Hyperspace Mining', up2: 'Achronal Analysis', backName: 'Wormhole Grid', back: 'UUF➪TBYgbb*wg' },
  { id: 'imdril-fleet-support-3', species: 'imdril', name: 'Fleet Support, 3', era: 1, cost: 'OOB→$', front: 'FFF' },
  { id: 'imdril-megastructures', species: 'imdril', name: 'Megastructures', era: 3, cost: 'Researched', front: 'UUUF➪$$$$$gb', up1: 'Temporal Dilation', up2: 'Matter Generation', backName: 'Dyson Swarms', back: 'UUUF➪$$$$$$gbT' },
  { id: 'imdril-fleet-support-1', species: 'imdril', name: 'Fleet Support, 1', era: 1, cost: 'BBB→$', front: 'F' },
  { id: 'imdril-fleet-support-1-2', species: 'imdril', name: 'Fleet Support, 1', era: 1, cost: 'Bbbb→$', front: 'F' },
  { id: 'imdril-fleet-support-1-3', species: 'imdril', name: 'Fleet Support, 1', era: 1, cost: 'OB→$', front: 'F' },
  { id: 'imdril-fleet-support-2', species: 'imdril', name: 'Fleet Support, 2', era: 1, cost: 'BBbbb→$', front: 'FF' },
  { id: 'imdril-starting-fleet-support-2', species: 'imdril', name: 'Starting Fleet Support, 2', era: 0, cost: 'Starting' },
  { id: 'imdril-fleet-support-2-2', species: 'imdril', name: 'Fleet Support, 2', era: 1, cost: 'Obbb→$', front: 'FF' },
  { id: 'kjas-nanotechnology', species: 'kjas', name: 'Nanotechnology', era: 1, cost: 'Researched', front: 'bbb➪Ug', up1: 'Genetic Engineering', up2: 'Atomic Transmutation', backName: 'Nanofabricators', back: 'bbb➪UgB' },
  { id: 'kjas-genetic-engineering', species: 'kjas', name: 'Genetic Engineering', era: 1, cost: 'Researched', front: 'ggg➪TBw', up1: 'Nanotechnology', up2: 'Clinical Immortality', backName: 'Genetic Resynthesis', back: 'ggg➪TBwB' },
  { id: 'kjas-universal-translator', species: 'kjas', name: 'Universal Translator', era: 1, cost: 'Researched', front: 'www➪$+B', up1: 'Ubiquitous Cultural Repository', up2: 'Quantum Computers', backName: 'Universal Empathic Communication', back: 'www➪$+Bwg' },
  { id: 'kjas-antimatter-power', species: 'kjas', name: 'Antimatter Power', era: 2, cost: 'Researched', front: 'bbbb➪YBBw', up1: 'Hyperspace Mining', up2: 'Organic Construction', backName: 'Antimatter Compounds', back: 'bbbb➪YBBwgw' },
  { id: 'kjas-interspecies-medical-exchange', species: 'kjas', name: 'Interspecies Medical Exchange', era: 2, cost: 'Researched', front: 'gggg➪$w+gg', up1: 'Cross Species Ethical Equality', up2: 'Organic Construction', backName: 'Panbiologic Medicine', back: 'gggg➪$wwB+gg' },
  { id: 'kjas-cross-species-ethical-equality', species: 'kjas', name: 'Cross Species Ethical Equality', era: 2, cost: 'Researched', front: 'wwww➪$+$w', up1: 'Interspecies Medical Exchange', up2: 'Achronal Analysis', backName: 'Concrete Universal Metaethics', back: 'wwww➪$U+$w' },
  { id: 'kjas-xeno-cultural-exchange', species: 'kjas', name: 'Xeno Cultural Exchange', era: 3, cost: 'Researched', front: 'bbbbb➪$Bwggg+$', up1: 'Megastructures', up2: 'Social Exodus', backName: 'Multispecies Hybrid Cultures', back: 'bbbbb➪$$Bwggg+$Bb' },
  { id: 'kjas-poly-species-corporations', species: 'kjas', name: 'Poly Species Corporations', era: 3, cost: 'Researched', front: 'ggggg➪$YY**+bgww', up1: 'Galactic Telecomm Control', up2: 'Xeno Cultural Exchange', backName: 'Full Interspecies Integration', back: 'ggggg➪$$YY**+bbgww' },
  { id: 'kjas-social-exodus', species: 'kjas', name: 'Social Exodus', era: 3, cost: 'Researched', front: 'wwwww➪$**T+$**BT', up1: 'Galactic Telecomm Control', up2: 'Xeno Cultural Exchange', backName: 'Galactic Colonization', back: 'wwwww➪$$**T+$**BTg' },
  { id: 'kjas-quantum-computers', species: 'kjas', name: 'Quantum Computers', era: 1, cost: 'Researched', front: 'BB➪TYw', up1: 'Universal Translator', up2: 'Clinical Immortality', backName: 'Nondeterministic Polynomial Collapse', back: 'BB➪TYwY' },
  { id: 'kjas-clinical-immortality', species: 'kjas', name: 'Clinical Immortality', era: 1, cost: 'Researched', front: 'TT➪$g', up1: 'Genetic Engineering', up2: 'Atomic Transmutation', backName: 'Practical Immortality', back: 'TT➪$gB' },
  { id: 'kjas-ubiquitous-cultural-repository', species: 'kjas', name: 'Ubiquitous Cultural Repository', era: 1, cost: 'Researched', front: 'YY➪$g', up1: 'Universal Translator', up2: 'Quantum Computers', backName: 'Memetic Lifeforms', back: 'YY➪$gB' },
  { id: 'kjas-achronal-analysis', species: 'kjas', name: 'Achronal Analysis', era: 2, cost: 'Researched', front: 'BBB➪UTwb', up1: 'Antimatter Power', up2: 'Singularity Control', backName: 'Time Viewers', back: 'BBB➪UTwbgY' },
  { id: 'kjas-organic-construction', species: 'kjas', name: 'Organic Construction', era: 2, cost: 'Researched', front: 'TTT➪**wbgg', up1: 'Interspecies Medical Exchange', up2: 'Cross Species Ethical Equality', backName: 'Living Infrastructure', back: 'TTT➪B**wbgg' },
  { id: 'kjas-hyperspace-mining', species: 'kjas', name: 'Hyperspace Mining', era: 2, cost: 'Researched', front: 'YYY➪UB+BB', up1: 'Antimatter Power', up2: 'Singularity Control', backName: 'Hyperspace Settlements', back: 'YYY➪UBTwg+BB' },
  { id: 'kjas-galactic-telecomm-control', species: 'kjas', name: 'Galactic Telecomm Control', era: 3, cost: 'Researched', front: 'BBBB➪$$$bbw', up1: 'Poly Species Corporations', up2: 'Social Exodus', backName: 'Galactic Domination', back: 'BBBB➪$$$$Tbbw' },
  { id: 'kjas-temporal-dilation', species: 'kjas', name: 'Temporal Dilation', era: 3, cost: 'Researched', front: 'TTTT➪$$Uggw', up1: 'Megastructures', up2: 'Matter Generation', backName: 'Stasis Field', back: 'TTTT➪$$$Uggw+U' },
  { id: 'kjas-matter-generation', species: 'kjas', name: 'Matter Generation', era: 3, cost: 'Researched', front: 'YYYY➪$$UTwb', up1: 'Poly Species Corporations', up2: 'Temporal Dilation', backName: 'Macroscale Teleportation', back: 'YYYY➪$$$UTwbb' },
  { id: 'kjas-starstrider-jumpcores', species: 'kjas', name: 'Starstrider Jumpcores', era: 0, cost: 'Starting', front: 'TT➪g****', up1: 'Hyperspace Mining', up2: 'Singularity Control', backName: 'Fastjump Network', back: 'TT➪$*****' },
  { id: 'kjas-underground-cities', species: 'kjas', name: 'Underground Cities', era: 0, cost: 'Starting', front: '➪bb***', up1: 'Organic Construction', up2: 'Antimatter Power', backName: 'Asteroid Mine Network', back: '➪bb***T' },
  { id: 'kjas-atomic-transmutation', species: 'kjas', name: 'Atomic Transmutation', era: 1, cost: 'Researched', front: 'U➪YBb', up1: 'Ubiquitous Cultural Repository', up2: 'Nanotechnology', backName: 'Pseudomaterials', back: 'U➪YBbT' },
  { id: 'kjas-perfume-pheromone-loyalty', species: 'kjas', name: 'Perfume Pheromone Loyalty', era: 0, cost: 'Starting', front: 'bbbb➪YBTw', up1: 'Genetic Engineering', up2: 'Nanotechnology', backName: 'Multiconformal Pheromonics', back: 'bbbb➪YBTw+gb' },
  { id: 'kjas-singularity-control', species: 'kjas', name: 'Singularity Control', era: 2, cost: 'Researched', front: 'UU➪YTBwwb*', up1: 'Hyperspace Mining', up2: 'Achronal Analysis', backName: 'Wormhole Grid', back: 'UU➪YTBwwwbb*' },
  { id: 'kjas-megastructures', species: 'kjas', name: 'Megastructures', era: 3, cost: 'Researched', front: 'UUU➪$$$$$wg', up1: 'Temporal Dilation', up2: 'Matter Generation', backName: 'Dyson Swarms', back: 'UUU➪$$$$$$wgY' },
  { id: 'kt-nanotechnology', species: 'kt', name: 'Nanotechnology', era: 1, cost: 'Researched', front: 'bbb➪Uw', up1: 'Genetic Engineering', up2: 'Atomic Transmutation', backName: 'Nanofabricators', back: 'bbb➪UwB' },
  { id: 'kt-genetic-engineering', species: 'kt', name: 'Genetic Engineering', era: 1, cost: 'Researched', front: 'ggg➪TBb', up1: 'Nanotechnology', up2: 'Clinical Immortality', backName: 'Genetic Resynthesis', back: 'ggg➪TBbB' },
  { id: 'kt-universal-translator', species: 'kt', name: 'Universal Translator', era: 1, cost: 'Researched', front: 'www➪$+T', up1: 'Ubiquitous Cultural Repository', up2: 'Quantum Computers', backName: 'Universal Empathic Communication', back: 'www➪$+Twb' },
  { id: 'kt-antimatter-power', species: 'kt', name: 'Antimatter Power', era: 2, cost: 'Researched', front: 'bbbb➪BBTw', up1: 'Hyperspace Mining', up2: 'Organic Construction', backName: 'Antimatter Compounds', back: 'bbbb➪BBTwgw' },
  { id: 'kt-interspecies-medical-exchange', species: 'kt', name: 'Interspecies Medical Exchange', era: 2, cost: 'Researched', front: 'gggg➪$w+bb', up1: 'Cross Species Ethical Equality', up2: 'Organic Construction', backName: 'Panbiologic Medicine', back: 'gggg➪$wbT+bb' },
  { id: 'kt-cross-species-ethical-equality', species: 'kt', name: 'Cross Species Ethical Equality', era: 2, cost: 'Researched', front: 'wwww➪$+$b', up1: 'Interspecies Medical Exchange', up2: 'Achronal Analysis', backName: 'Concrete Universal Metaethics', back: 'wwww➪$U+$b' },
  { id: 'kt-xeno-cultural-exchange', species: 'kt', name: 'Xeno Cultural Exchange', era: 3, cost: 'Researched', front: 'bbbbb➪$Tgggw+$', up1: 'Megastructures', up2: 'Social Exodus', backName: 'Multispecies Hybrid Cultures', back: 'bbbbb➪$$Tgggw+$Bb' },
  { id: 'kt-poly-species-corporations', species: 'kt', name: 'Poly Species Corporations', era: 3, cost: 'Researched', front: 'ggggg➪$YT**+wwwb', up1: 'Galactic Telecomm Control', up2: 'Xeno Cultural Exchange', backName: 'Full Interspecies Integration', back: 'ggggg➪$$YT**+wwwwb' },
  { id: 'kt-social-exodus', species: 'kt', name: 'Social Exodus', era: 3, cost: 'Researched', front: 'wwwww➪$**B+$**BT', up1: 'Galactic Telecomm Control', up2: 'Xeno Cultural Exchange', backName: 'Galactic Colonization', back: 'wwwww➪$$**B+$**BTb' },
  { id: 'kt-quantum-computers', species: 'kt', name: 'Quantum Computers', era: 1, cost: 'Researched', front: 'BB➪TYw', up1: 'Universal Translator', up2: 'Clinical Immortality', backName: 'Nondeterministic Polynomial Collapse', back: 'BB➪TYwT' },
  { id: 'kt-clinical-immortality', species: 'kt', name: 'Clinical Immortality', era: 1, cost: 'Researched', front: 'TT➪$b', up1: 'Genetic Engineering', up2: 'Atomic Transmutation', backName: 'Practical Immortality', back: 'TT➪$bB' },
  { id: 'kt-ubiquitous-cultural-repository', species: 'kt', name: 'Ubiquitous Cultural Repository', era: 1, cost: 'Researched', front: 'YY➪$b', up1: 'Universal Translator', up2: 'Quantum Computers', backName: 'Memetic Lifeforms', back: 'YY➪$bT' },
  { id: 'kt-achronal-analysis', species: 'kt', name: 'Achronal Analysis', era: 2, cost: 'Researched', front: 'BBB➪UTwg', up1: 'Antimatter Power', up2: 'Singularity Control', backName: 'Time Viewers', back: 'BBB➪UTwgbT' },
  { id: 'kt-organic-construction', species: 'kt', name: 'Organic Construction', era: 2, cost: 'Researched', front: 'TTT➪**wwbg', up1: 'Interspecies Medical Exchange', up2: 'Cross Species Ethical Equality', backName: 'Living Infrastructure', back: 'TTT➪**wwbgB' },
  { id: 'kt-hyperspace-mining', species: 'kt', name: 'Hyperspace Mining', era: 2, cost: 'Researched', front: 'YYY➪UT+TB', up1: 'Antimatter Power', up2: 'Singularity Control', backName: 'Hyperspace Settlements', back: 'YYY➪UTBww+TB' },
  { id: 'kt-galactic-telecomm-control', species: 'kt', name: 'Galactic Telecomm Control', era: 3, cost: 'Researched', front: 'BBBB➪$$$bbg', up1: 'Poly Species Corporations', up2: 'Social Exodus', backName: 'Galactic Domination', back: 'BBBB➪$$$$Ybbg' },
  { id: 'kt-temporal-dilation', species: 'kt', name: 'Temporal Dilation', era: 3, cost: 'Researched', front: 'TTTT➪$$Ubbw', up1: 'Megastructures', up2: 'Matter Generation', backName: 'Stasis Field', back: 'TTTT➪$$$Ubbw+U' },
  { id: 'kt-matter-generation', species: 'kt', name: 'Matter Generation', era: 3, cost: 'Researched', front: 'YYYY➪$$UBww', up1: 'Poly Species Corporations', up2: 'Temporal Dilation', backName: 'Macroscale Teleportation', back: 'YYYY➪$$$UBwww' },
  { id: 'kt-polyutility-components', species: 'kt', name: 'Polyutility Components', era: 0, cost: 'Starting', front: '*', up1: 'Atomic Transmutation', up2: 'Quantum Computers', backName: 'Adaptive Architecture', back: '*T' },
  { id: 'kt-hand-crafted', species: 'kt', name: 'Hand Crafted', era: 0, cost: 'Starting', front: '➪U', up1: 'Organic Construction', up2: 'Achronal Analysis', backName: 'Microfabricated', back: '➪gbU' },
  { id: 'kt-atomic-transmutation', species: 'kt', name: 'Atomic Transmutation', era: 1, cost: 'Researched', front: 'U➪BBg', up1: 'Ubiquitous Cultural Repository', up2: 'Nanotechnology', backName: 'Pseudomaterials', back: 'U➪BBgY' },
  { id: 'kt-high-risk-laboratories', species: 'kt', name: 'High-Risk Laboratories', era: 0, cost: 'Starting', front: 'wgbb', up1: 'Hyperspace Mining', up2: 'Singularity Control', backName: 'Stellar Power Harnessing', back: 'wwggbb' },
  { id: 'kt-anarchic-sacrificial', species: 'kt', name: 'Anarchic Sacrificial', era: 0, cost: 'Starting', front: 'U➪', up1: 'Clinical Immortality', up2: 'Universal Translator', backName: 'Polysystem', back: 'U➪B' },
  { id: 'kt-singularity-control', species: 'kt', name: 'Singularity Control', era: 2, cost: 'Researched', front: 'UU➪YYBwbg*', up1: 'Hyperspace Mining', up2: 'Achronal Analysis', backName: 'Wormhole Grid', back: 'UU➪YYBwbg*wb' },
  { id: 'kt-diffusion', species: 'kt', name: 'Diffusion', era: 0, cost: 'Starting', front: 'TYB****', up1: 'Nanotechnology', up2: 'Genetic Engineering', backName: 'Teleological Redesign', back: 'TYB****+wb' },
  { id: 'kt-expansive-social', species: 'kt', name: 'Expansive Social', era: 0, cost: 'Starting', front: 'ggggg➪', up1: 'Cross Species Ethical Equality', up2: 'Interspecies Medical Exchange', backName: 'Psychohistoric', back: 'ggggg➪wb' },
  { id: 'kt-megastructures', species: 'kt', name: 'Megastructures', era: 3, cost: 'Researched', front: 'UUU➪$$$$$bb', up1: 'Temporal Dilation', up2: 'Matter Generation', backName: 'Dyson Swarms', back: 'UUU➪$$$$$$bbT' },
  { id: 'kt-zd-nx', species: 'kt', name: 'Zd\'Nx', era: 1, cost: 'Y→', front: 'J,B➪wg' },
  { id: 'kt-kz-tlr', species: 'kt', name: 'Kz\'Tlr', era: 1, cost: 'Y→', front: 'J,w➪B' },
  { id: 'kt-kln-qn', species: 'kt', name: 'Kln\'Qn', era: 1, cost: 'YY→', front: 'I,➪w' },
  { id: 'kt-nz-cht-qt-rz', species: 'kt', name: 'Nz\'Cht\'Qt\'Rz', era: 1, cost: 'YY→', front: 'W,Y➪U' },
  { id: 'kt-tn-rg-tx-tc', species: 'kt', name: 'Tn\'Rg\'Tx\'Tc', era: 1, cost: 'Y→', front: 'D,B➪wg' },
  { id: 'kt-gz-zd', species: 'kt', name: 'Gz\'Zd', era: 1, cost: 'YY→', front: 'J,➪w' },
  { id: 'kt-in-zr-kz', species: 'kt', name: '!IN\'ZR\'KZ', era: 1, cost: 'YY→', front: 'D,wb➪YB' },
  { id: 'kt-tk-t-zk', species: 'kt', name: 'Tk\'T!\'Zk', era: 1, cost: 'YY→', front: 'D,➪b' },
  { id: 'kt-kr-xn-xx', species: 'kt', name: 'Kr\'Xn\'Xx', era: 1, cost: 'Y→', front: 'I,b➪T' },
  { id: 'kt-kt-dq-rn-nr', species: 'kt', name: 'Kt\'Dq\'Rn\'Nr', era: 1, cost: 'Y→', front: 'W,b➪B' },
  { id: 'kt-nx-xt-in', species: 'kt', name: 'Nx\'Xt\'!In', era: 1, cost: 'YY→', front: 'I,➪b' },
  { id: 'kt-nx-dr', species: 'kt', name: 'Nx\'Dr', era: 1, cost: 'Y→', front: 'D,g➪T' },
  { id: 'kt-nz-tt', species: 'kt', name: 'Nz\'Tt', era: 1, cost: 'Y→', front: 'W,T➪wb' },
  { id: 'unity-universal-translator', species: 'unity', name: 'Universal Translator', era: 1, cost: 'Researched', front: 'www➪$+B', up1: 'Ubiquitous Cultural Repository', up2: 'Quantum Computers', backName: 'Universal Empathic Communication', back: 'sss➪$+BA' },
  { id: 'unity-limit', species: 'unity', name: 'Limit', era: 1, cost: 'LLLN→$', front: 'U➪Aaaa', up1: 'Universal Translator', up2: 'Quantum Computers', backName: 'Limit', back: 'U➪Aaaa+a' },
  { id: 'unity-cross-species-ethical-equality', species: 'unity', name: 'Cross Species Ethical Equality', era: 2, cost: 'Researched', front: 'wwww➪$+$w', up1: 'Interspecies Medical Exchange', up2: 'Achronal Analysis', backName: 'Concrete Universal Metaethics', back: 'wwww➪$Aa+$w' },
  { id: 'unity-nanotechnology', species: 'unity', name: 'Nanotechnology', era: 1, cost: 'Researched', front: 'bbb➪Uw', up1: 'Genetic Engineering', up2: 'Atomic Transmutation', backName: 'Nanofabricators', back: 'sss➪Uwa' },
  { id: 'unity-genetic-engineering', species: 'unity', name: 'Genetic Engineering', era: 1, cost: 'Researched', front: 'ggg➪TBb', up1: 'Nanotechnology', up2: 'Clinical Immortality', backName: 'Genetic Resynthesis', back: 'sss➪YBba' },
  { id: 'unity-social-exodus', species: 'unity', name: 'Social Exodus', era: 3, cost: 'Researched', front: 'wwwww➪$**B+$**YT', up1: 'Galactic Telecomm Control', up2: 'Xeno Cultural Exchange', backName: 'Galactic Colonization', back: 'wwwww➪$$**B+$**YgT' },
  { id: 'unity-antimatter-power', species: 'unity', name: 'Antimatter Power', era: 2, cost: 'Researched', front: 'bbbb➪YYTg', up1: 'Hyperspace Mining', up2: 'Organic Construction', backName: 'Antimatter Compounds', back: 'bbbb➪YYTgA' },
  { id: 'unity-interspecies-medical-exchange', species: 'unity', name: 'Interspecies Medical Exchange', era: 2, cost: 'Researched', front: 'gggg➪$w+bb', up1: 'Cross Species Ethical Equality', up2: 'Organic Construction', backName: 'Panbiologic Medicine', back: 'gggg➪$waa+bb' },
  { id: 'unity-ubiquitous-cultural-repository', species: 'unity', name: 'Ubiquitous Cultural Repository', era: 1, cost: 'Researched', front: 'YY➪$b', up1: 'Universal Translator', up2: 'Quantum Computers', backName: 'Memetic Lifeforms', back: 'LL➪$ba' },
  { id: 'unity-xeno-cultural-exchange', species: 'unity', name: 'Xeno Cultural Exchange', era: 3, cost: 'Researched', front: 'bbbbb➪$Twwgg+$', up1: 'Megastructures', up2: 'Social Exodus', backName: 'Multispecies Hybrid Cultures', back: 'bbbbb➪$$Twwgg+$Bw' },
  { id: 'unity-poly-species-corporations', species: 'unity', name: 'Poly Species Corporations', era: 3, cost: 'Researched', front: 'ggggg➪$YB**+bggw', up1: 'Galactic Telecomm Control', up2: 'Xeno Cultural Exchange', backName: 'Full Interspecies Integration', back: 'ggggg➪$$YB**+bgggw' },
  { id: 'unity-hyperspace-mining', species: 'unity', name: 'Hyperspace Mining', era: 2, cost: 'Researched', front: 'YYY➪UT+BB', up1: 'Antimatter Power', up2: 'Singularity Control', backName: 'Hyperspace Settlements', back: 'YYY➪UTAA+BB' },
  { id: 'unity-quantum-computers', species: 'unity', name: 'Quantum Computers', era: 1, cost: 'Researched', front: 'BB➪TYg', up1: 'Universal Translator', up2: 'Clinical Immortality', backName: 'Nondeterministic Polynomial Collapse', back: 'LL➪TYga' },
  { id: 'unity-clinical-immortality', species: 'unity', name: 'Clinical Immortality', era: 1, cost: 'Researched', front: 'TT➪$w', up1: 'Genetic Engineering', up2: 'Atomic Transmutation', backName: 'Practical Immortality', back: 'LL➪$wa' },
  { id: 'unity-matter-generation', species: 'unity', name: 'Matter Generation', era: 3, cost: 'Researched', front: 'YYYY➪$$UBbw', up1: 'Poly Species Corporations', up2: 'Temporal Dilation', backName: 'Macroscale Teleportation', back: 'YYYY➪$$$UBbwb' },
  { id: 'unity-achronal-analysis', species: 'unity', name: 'Achronal Analysis', era: 2, cost: 'Researched', front: 'BBB➪UTgg', up1: 'Antimatter Power', up2: 'Singularity Control', backName: 'Time Viewers', back: 'BBB➪UTggaa' },
  { id: 'unity-organic-construction', species: 'unity', name: 'Organic Construction', era: 2, cost: 'Researched', front: 'TTT➪**wwbg', up1: 'Interspecies Medical Exchange', up2: 'Cross Species Ethical Equality', backName: 'Living Infrastructure', back: 'TTT➪**wwbgA' },
  { id: 'unity-atomic-transmutation', species: 'unity', name: 'Atomic Transmutation', era: 1, cost: 'Researched', front: 'U➪BTb', up1: 'Ubiquitous Cultural Repository', up2: 'Nanotechnology', backName: 'Pseudomaterials', back: 'U➪BTba' },
  { id: 'unity-galactic-telecomm-control', species: 'unity', name: 'Galactic Telecomm Control', era: 3, cost: 'Researched', front: 'BBBB➪$$$ggb', up1: 'Poly Species Corporations', up2: 'Social Exodus', backName: 'Galactic Domination', back: 'BBBB➪$$$$Tggb' },
  { id: 'unity-temporal-dilation', species: 'unity', name: 'Temporal Dilation', era: 3, cost: 'Researched', front: 'TTTT➪$$Ubbw', up1: 'Megastructures', up2: 'Matter Generation', backName: 'Stasis Field', back: 'TTTT➪$$$Ubbw+U' },
  { id: 'unity-singularity-control', species: 'unity', name: 'Singularity Control', era: 2, cost: 'Researched', front: 'UU➪YBBgwb*', up1: 'Hyperspace Mining', up2: 'Achronal Analysis', backName: 'Wormhole Grid', back: 'UU➪YBBgwb*A' },
  { id: 'unity-fractal-symmetry', species: 'unity', name: 'Fractal Symmetry', era: 1, cost: 'ssLN→$', front: 'ssL➪AU', up1: 'Singularity Control', up2: 'Hyperspace Mining', backName: 'Fractal Symmetry', back: 'ssL➪AU+Aa' },
  { id: 'unity-explorer-collection', species: 'unity', name: 'Explorer Collection', era: 0, cost: 'Starting', front: 'sss➪**Bb', up1: 'LLN→$', up2: 'Achronal Analysis', backName: 'Gravity Sunlens Sensor Array', back: 'sss➪**BbA' },
  { id: 'unity-megastructures', species: 'unity', name: 'Megastructures', era: 3, cost: 'Researched', front: 'UUU➪$$$$$wb', up1: 'Temporal Dilation', up2: 'Matter Generation', backName: 'Dyson Swarms', back: 'UUU➪$$$$$$wbY' },
  { id: 'unity-adamantine-synthesis', species: 'unity', name: 'Adamantine Synthesis', era: 0, cost: 'Starting', front: 'LL➪Ug', up1: 'Atomic Transmutation', up2: 'Clinical Immortality', backName: 'Programmable Pseudomatter', back: 'LL➪Uga' },
  { id: 'unity-adaptive-fabrication', species: 'unity', name: 'Adaptive Fabrication', era: 0, cost: 'Starting', front: '➪Aa*', up1: 'sssN→$', up2: 'Nanotechnology', backName: 'Predictive Fabrication', back: '➪Aa*a' },
  { id: 'unity-b-zier', species: 'unity', name: 'Bézier', era: 1, cost: 'sssN→$', front: 'sss➪Aaa', up1: 'Organic Construction', up2: 'Antimatter Power', backName: 'Bézier', back: 'sss➪Aaa+A' },
  { id: 'unity-color-space', species: 'unity', name: 'Color Space', era: 1, cost: 'LLN→$', front: 'LL➪Aaa', up1: 'Interspecies Medical Exchange', up2: 'Cross Species Ethical Equality', backName: 'Color Space', back: 'LL➪Aaa+A' },
  { id: 'yengii-nanotechnology', species: 'yengii', name: 'Nanotechnology', era: 1, cost: 'Researched', front: 'bbb➪Ug', up1: 'Genetic Engineering', up2: 'Atomic Transmutation', backName: 'Nanofabricators', back: 'bbb➪UgT' },
  { id: 'yengii-genetic-engineering', species: 'yengii', name: 'Genetic Engineering', era: 1, cost: 'Researched', front: 'ggg➪YBw', up1: 'Nanotechnology', up2: 'Clinical Immortality', backName: 'Genetic Resynthesis', back: 'ggg➪YBwY' },
  { id: 'yengii-universal-translator', species: 'yengii', name: 'Universal Translator', era: 1, cost: 'Researched', front: 'www➪$+T', up1: 'Ubiquitous Cultural Repository', up2: 'Quantum Computers', backName: 'Universal Empathic Communication', back: 'www➪$+Twg' },
  { id: 'yengii-antimatter-power', species: 'yengii', name: 'Antimatter Power', era: 2, cost: 'Researched', front: 'bbbb➪YTBg', up1: 'Hyperspace Mining', up2: 'Organic Construction', backName: 'Antimatter Compounds', back: 'bbbb➪YTBggw' },
  { id: 'yengii-interspecies-medical-exchange', species: 'yengii', name: 'Interspecies Medical Exchange', era: 2, cost: 'Researched', front: 'gggg➪$w+wb', up1: 'Cross Species Ethical Equality', up2: 'Organic Construction', backName: 'Panbiologic Medicine', back: 'gggg➪$wbT+wb' },
  { id: 'yengii-cross-species-ethical-equality', species: 'yengii', name: 'Cross Species Ethical Equality', era: 2, cost: 'Researched', front: 'wwww➪$+$g', up1: 'Interspecies Medical Exchange', up2: 'Achronal Analysis', backName: 'Concrete Universal Metaethics', back: 'wwww➪$U+$g' },
  { id: 'yengii-xeno-cultural-exchange', species: 'yengii', name: 'Xeno Cultural Exchange', era: 3, cost: 'Researched', front: 'bbbbb➪$Ywwgg+$', up1: 'Megastructures', up2: 'Social Exodus', backName: 'Multispecies Hybrid Cultures', back: 'bbbbb➪$$Ywwgg+$Tg' },
  { id: 'yengii-poly-species-corporations', species: 'yengii', name: 'Poly Species Corporations', era: 3, cost: 'Researched', front: 'ggggg➪$YT**+ggwb', up1: 'Galactic Telecomm Control', up2: 'Xeno Cultural Exchange', backName: 'Full Interspecies Integration', back: 'ggggg➪$$YT**+ggwbw' },
  { id: 'yengii-social-exodus', species: 'yengii', name: 'Social Exodus', era: 3, cost: 'Researched', front: 'wwwww➪$**B+$**BT', up1: 'Galactic Telecomm Control', up2: 'Xeno Cultural Exchange', backName: 'Galactic Colonization', back: 'wwwww➪$$**B+$**BTb' },
  { id: 'yengii-quantum-computers', species: 'yengii', name: 'Quantum Computers', era: 1, cost: 'Researched', front: 'BB➪TYb', up1: 'Universal Translator', up2: 'Clinical Immortality', backName: 'Nondeterministic Polynomial Collapse', back: 'BB➪TYbY' },
  { id: 'yengii-clinical-immortality', species: 'yengii', name: 'Clinical Immortality', era: 1, cost: 'Researched', front: 'TT➪$g', up1: 'Genetic Engineering', up2: 'Atomic Transmutation', backName: 'Practical Immortality', back: 'TT➪$gB' },
  { id: 'yengii-ubiquitous-cultural-repository', species: 'yengii', name: 'Ubiquitous Cultural Repository', era: 1, cost: 'Researched', front: 'YY➪$w', up1: 'Universal Translator', up2: 'Quantum Computers', backName: 'Memetic Lifeforms', back: 'YY➪$wT' },
  { id: 'yengii-achronal-analysis', species: 'yengii', name: 'Achronal Analysis', era: 2, cost: 'Researched', front: 'BBB➪UYwg', up1: 'Antimatter Power', up2: 'Singularity Control', backName: 'Time Viewers', back: 'BBB➪UYwggT' },
  { id: 'yengii-organic-construction', species: 'yengii', name: 'Organic Construction', era: 2, cost: 'Researched', front: 'TTT➪**wbgg', up1: 'Interspecies Medical Exchange', up2: 'Cross Species Ethical Equality', backName: 'Living Infrastructure', back: 'TTT➪**wbggY' },
  { id: 'yengii-hyperspace-mining', species: 'yengii', name: 'Hyperspace Mining', era: 2, cost: 'Researched', front: 'YYY➪UT+TY', up1: 'Antimatter Power', up2: 'Singularity Control', backName: 'Hyperspace Settlements', back: 'YYY➪UTbbB+TY' },
  { id: 'yengii-galactic-telecomm-control', species: 'yengii', name: 'Galactic Telecomm Control', era: 3, cost: 'Researched', front: 'BBBB➪$$$bbw', up1: 'Poly Species Corporations', up2: 'Social Exodus', backName: 'Galactic Domination', back: 'BBBB➪$$$$Ybbw' },
  { id: 'yengii-temporal-dilation', species: 'yengii', name: 'Temporal Dilation', era: 3, cost: 'Researched', front: 'TTTT➪$$Ubww', up1: 'Megastructures', up2: 'Matter Generation', backName: 'Stasis Field', back: 'TTTT➪$$$Ubww+U' },
  { id: 'yengii-matter-generation', species: 'yengii', name: 'Matter Generation', era: 3, cost: 'Researched', front: 'YYYY➪$$UTbg', up1: 'Poly Species Corporations', up2: 'Temporal Dilation', backName: 'Macroscale Teleportation', back: 'YYYY➪$$$UTbgw' },
  { id: 'yengii-choice-of-paths', species: 'yengii', name: 'Choice of Paths', era: 0, cost: 'Starting', front: 'wwB➪Ugg', up1: 'TTW→$', up2: 'Ubiquitous Cultural Repository', backName: 'Alien Decision Integration', back: 'wwB➪Uggbb' },
  { id: 'yengii-empathy-of-words', species: 'yengii', name: 'Empathy of Words', era: 0, cost: 'Starting', front: 'bbT➪BBww', up1: 'ggJ→$', up2: 'Cross Species Ethical Equality', backName: 'Interspecies Diplomatic Demesne', back: 'bbT➪BBwwY' },
  { id: 'yengii-atomic-transmutation', species: 'yengii', name: 'Atomic Transmutation', era: 1, cost: 'Researched', front: 'U➪YBb', up1: 'Ubiquitous Cultural Repository', up2: 'Nanotechnology', backName: 'Pseudomaterials', back: 'U➪YBTb' },
  { id: 'yengii-innovation-of-hands', species: 'yengii', name: 'Innovation of Hands', era: 0, cost: 'Starting', front: 'U➪**Yg', up1: 'BBD→$', up2: 'Achronal Analysis', backName: 'Cross-time Think Tank', back: 'U➪**Yg+gw' },
  { id: 'yengii-work-of-mules', species: 'yengii', name: 'Work of Mules', era: 0, cost: 'Starting', front: 'ggY➪**Tbb', up1: 'UI→$', up2: 'Singularity Control', backName: 'Gravitic Assembly', back: 'ggY➪**Tbbb+ww' },
  { id: 'yengii-singularity-control', species: 'yengii', name: 'Singularity Control', era: 2, cost: 'Researched', front: 'UU➪YBBbbw*', up1: 'Hyperspace Mining', up2: 'Achronal Analysis', backName: 'Wormhole Grid', back: 'UU➪YBBwwbbg*' },
  { id: 'yengii-megastructures', species: 'yengii', name: 'Megastructures', era: 3, cost: 'Researched', front: 'UUU➪$$$$$gb', up1: 'Temporal Dilation', up2: 'Matter Generation', backName: 'Dyson Swarms', back: 'UUU➪$$$$$$gbB' },
  { id: 'yengii-social-ecological-mutualism', species: 'yengii', name: 'Social Ecological Mutualism', era: 0, cost: 'Starting', front: '➪Tb**', up1: 'Interspecies Medical Exchange', up2: 'Antimatter Power', backName: 'Mutualistic Alien Integration', back: '➪Tb**gw' },
  { id: 'zeth-smuggling-network', species: 'zeth', name: 'Smuggling Network', era: 0, cost: 'Starting', front: 'ZZZB/YYw➾U', up1: 'Hyperspace Mining', backName: 'In-Hyperspace Hijacking', back: 'ZZB/YY➾Us' },
  { id: 'zeth-nanotechnology', species: 'zeth', name: 'Nanotechnology', era: 1, cost: 'Researched', front: 'bbb➪Ug', up1: 'Genetic Engineering', up2: 'Atomic Transmutation', backName: 'Nanofabricators', back: 'bbb➪UgT' },
  { id: 'zeth-genetic-engineering', species: 'zeth', name: 'Genetic Engineering', era: 1, cost: 'Researched', front: 'ggg➪YTb', up1: 'Nanotechnology', up2: 'Clinical Immortality', backName: 'Genetic Resynthesis', back: 'ggg➪YTbT' },
  { id: 'zeth-universal-translator', species: 'zeth', name: 'Universal Translator', era: 1, cost: 'Researched', front: 'www➪$+B', up1: 'Ubiquitous Cultural Repository', up2: 'Quantum Computers', backName: 'Universal Empathic Communication', back: 'www➪$+Bgb' },
  { id: 'zeth-antimatter-power', species: 'zeth', name: 'Antimatter Power', era: 2, cost: 'Researched', front: 'bbbb➪TTYw', up1: 'Hyperspace Mining', up2: 'Organic Construction', backName: 'Antimatter Compounds', back: 'bbbb➪TTYwgg' },
  { id: 'zeth-interspecies-medical-exchange', species: 'zeth', name: 'Interspecies Medical Exchange', era: 2, cost: 'Researched', front: 'gggg➪$w+gb', up1: 'Cross Species Ethical Equality', up2: 'Organic Construction', backName: 'Panbiologic Medicine', back: 'gggg➪$wTb+gb' },
  { id: 'zeth-cross-species-ethical-equality', species: 'zeth', name: 'Cross Species Ethical Equality', era: 2, cost: 'Researched', front: 'wwww➪$+$g', up1: 'Interspecies Medical Exchange', up2: 'Achronal Analysis', backName: 'Concrete Universal Metaethics', back: 'wwww➪$U+$g' },
  { id: 'zeth-xeno-cultural-exchange', species: 'zeth', name: 'Xeno Cultural Exchange', era: 3, cost: 'Researched', front: 'bbbbb➪$Tgggw+$', up1: 'Megastructures', up2: 'Social Exodus', backName: 'Multispecies Hybrid Cultures', back: 'bbbbb➪$$Tgggw+$Bw' },
  { id: 'zeth-poly-species-corporations', species: 'zeth', name: 'Poly Species Corporations', era: 3, cost: 'Researched', front: 'ggggg➪$YT**+bbgw', up1: 'Galactic Telecomm Control', up2: 'Xeno Cultural Exchange', backName: 'Full Interspecies Integration', back: 'ggggg➪$$YT**+bbgwb' },
  { id: 'zeth-social-exodus', species: 'zeth', name: 'Social Exodus', era: 3, cost: 'Researched', front: 'wwwww➪$**T+$**YB', up1: 'Galactic Telecomm Control', up2: 'Xeno Cultural Exchange', backName: 'Galactic Colonization', back: 'wwwww➪$$**T+$**YBg' },
  { id: 'zeth-quantum-computers', species: 'zeth', name: 'Quantum Computers', era: 1, cost: 'Researched', front: 'BB➪TTw', up1: 'Universal Translator', up2: 'Clinical Immortality', backName: 'Nondeterministic Polynomial Collapse', back: 'BB➪TTwY' },
  { id: 'zeth-clinical-immortality', species: 'zeth', name: 'Clinical Immortality', era: 1, cost: 'Researched', front: 'TT➪$g', up1: 'Genetic Engineering', up2: 'Atomic Transmutation', backName: 'Practical Immortality', back: 'TT➪$gB' },
  { id: 'zeth-ubiquitous-cultural-repository', species: 'zeth', name: 'Ubiquitous Cultural Repository', era: 1, cost: 'Researched', front: 'YY➪$g', up1: 'Universal Translator', up2: 'Quantum Computers', backName: 'Memetic Lifeforms', back: 'YY➪$gT' },
  { id: 'zeth-achronal-analysis', species: 'zeth', name: 'Achronal Analysis', era: 2, cost: 'Researched', front: 'BBB➪UTwb', up1: 'Antimatter Power', up2: 'Singularity Control', backName: 'Time Viewers', back: 'BBB➪UTwbwT' },
  { id: 'zeth-organic-construction', species: 'zeth', name: 'Organic Construction', era: 2, cost: 'Researched', front: 'TTT➪**bbgg', up1: 'Interspecies Medical Exchange', up2: 'Cross Species Ethical Equality', backName: 'Living Infrastructure', back: 'TTT➪**bbggY' },
  { id: 'zeth-hyperspace-mining', species: 'zeth', name: 'Hyperspace Mining', era: 2, cost: 'Researched', front: 'YYY➪UT+TB', up1: 'Antimatter Power', up2: 'Singularity Control', backName: 'Hyperspace Settlements', back: 'YYY➪UTBwb+TB' },
  { id: 'zeth-galactic-telecomm-control', species: 'zeth', name: 'Galactic Telecomm Control', era: 3, cost: 'Researched', front: 'BBBB➪$$$bgg', up1: 'Poly Species Corporations', up2: 'Social Exodus', backName: 'Galactic Domination', back: 'BBBB➪$$$$Tbgg' },
  { id: 'zeth-temporal-dilation', species: 'zeth', name: 'Temporal Dilation', era: 3, cost: 'Researched', front: 'TTTT➪$$Uwwb', up1: 'Megastructures', up2: 'Matter Generation', backName: 'Stasis Field', back: 'TTTT➪$$$Uwwb+U' },
  { id: 'zeth-matter-generation', species: 'zeth', name: 'Matter Generation', era: 3, cost: 'Researched', front: 'YYYY➪$$UBbb', up1: 'Poly Species Corporations', up2: 'Temporal Dilation', backName: 'Macroscale Teleportation', back: 'YYYY➪$$$UBbbg' },
  { id: 'zeth-envoys', species: 'zeth', name: 'Envoys', era: 0, cost: 'Starting', front: 'www➪+ZTYgU', up1: 'Cross Species Ethical Equality', backName: 'Zeth Diaspora', back: 'www➪$+Z$U' },
  { id: 'zeth-cascading-deception', species: 'zeth', name: 'Cascading Deception', era: 0, cost: 'Starting', front: '➪*BB,B➪**', up1: 'Universal Translator', backName: 'Psychohistorical Deception', back: '➪*BBg,B➪** §' },
  { id: 'zeth-atomic-transmutation', species: 'zeth', name: 'Atomic Transmutation', era: 1, cost: 'Researched', front: 'U➪YBb', up1: 'Ubiquitous Cultural Repository', up2: 'Nanotechnology', backName: 'Pseudomaterials', back: 'U➪YBbT' },
  { id: 'zeth-systemic-bribery', species: 'zeth', name: 'Systemic Bribery', era: 0, cost: 'Starting', front: 'ZB/ww➾ss', up1: 'Achronal Analysis', backName: 'Predictive Agent Insertion', back: 'ZZZ/ZB/ww➾sss' },
  { id: 'zeth-black-market', species: 'zeth', name: 'Black Market', era: 0, cost: 'Starting', front: 'ZZ/B➾L', up1: 'Nanotechnology', backName: 'Undetectable Confidence Scams', back: 'ZZZ/ZB/BB➾LL' },
  { id: 'zeth-singularity-control', species: 'zeth', name: 'Singularity Control', era: 2, cost: 'Researched', front: 'UU➪TBYgbb*', up1: 'Hyperspace Mining', up2: 'Achronal Analysis', backName: 'Wormhole Grid', back: 'UU➪TBYgbb*wb' },
  { id: 'zeth-megastructures', species: 'zeth', name: 'Megastructures', era: 3, cost: 'Researched', front: 'UUU➪$$$$$gb', up1: 'Temporal Dilation', up2: 'Matter Generation', backName: 'Dyson Swarms', back: 'UUU➪$$$$$$gbY' },
  { id: 'kjas-balkanized-states-colonies', species: 'kjas', name: 'Balkanized States\' Colonies', era: 1, cost: 'DIbYY→$', front: 'T➪Bb+w,g➪**+w §', up1: 'WJDbb→$$', backName: 'Outer Reaches Hegemony', back: 'T➪Bb+w,g➪**+w,U➪$Y+wgb §' },
  { id: 'kjas-hadsja-vassal-territory', species: 'kjas', name: 'Hadsja Vassal Territory', era: 1, cost: 'DJYYY→$$', front: 'BB➪UTbg', up1: 'WDIYY→$$$', backName: 'Hadsja Empire', back: 'BB➪UTbg,YYY➪Tbggww** §' },
  { id: 'kjas-vagnleg-suzarainty', species: 'kjas', name: 'Vagnleg Suzarainty', era: 1, cost: 'DWYYY→$$', front: 'ww➪$Yb', up1: 'JDIYY→$$$', backName: 'Vagnleg Domination', back: 'ww➪$Yb,bbbb➪$Ug* §' },
]

// Faderan 遺跡世界的效果摘要（鍵＝牌庫卡 id）。來源：官方 Faderan 派系說明（Relic Worlds 頁）、FactionsCards.pdf、義大利文卡面；中文為 AI 自譯【待核對】。
// 沒收：Library of Entelechy、Barian Trade Armada、Thil’s Demiring 只有公式，沒有效果文字（卡面圖示無法確認），請對照實體卡。
export const SIDEREAL_FADERAN_RELIC_NOTES: Record<string, string> = {
  'faderan-automated-transport-network': '打出時從殖民地牌堆頂拿 2 張殖民地；持有者殖民地支援 +2（可借給別人一回合）；Im’dril 拿到可用它把殖民地留到經濟階段。',
  'faderan-star-s-ruin': '打出時得 2 分，再加上目前科技分享獎勵的分數（越早打越高）；之後沒有任何效果。',
  'faderan-transmutive-decomposer': '打出時得 1 分；和其他經濟轉換器一樣，不能收同一個經濟階段由別的轉換器產出的飛船。',
  'faderan-nalgorian-grindstone': '打出時得 1 分；要跑它的轉換器得先交 1 分回公共庫存，沒有分數就不能跑；同一經濟階段別的轉換器的產出不能當它的輸入。',
  'faderan-gift-of-the-duruntai': '每回合第一次被交易時，交出去的人拿到卡上列的資源，Faderan 得 1 個藍色（生物科技）方塊；同回合第二次交易沒有資源；這張卡沒有 Faderan 底色，回合結束不歸還；若 Faderan 是該回合第一個把它交易出去的人，就拿到全部資源。',
  'faderan-contextual-integrator-cache': '打出時，數非 Faderan 玩家手上的認可標記，每 3 個（進位）Faderan 得 1 分；持有認可標記的玩家發明用小或大方塊的科技時，費用少 1 個方塊（八角塊不適用，多個標記不疊加，也不能選擇不用或留到之後）。',
  'faderan-relic-detector': '打出時得 1 分；多一個交易階段的轉換器：棄 3 個綠與 1 個任意氣候殖民地（殖民地放牌堆底）抽一張遺跡世界，可和遺跡世界背面的轉換器同回合跑，所以一回合最多出兩張；不可交易。',
  'faderan-paradise-converter': '打出時得到卡上列的方塊；交易階段每回合一次，可把 1 個任意氣候的殖民地換成 2 分（殖民地放牌堆底）。',
  'faderan-the-grand-armilla': '打出時得 1 分；轉換器：不需投入，產出 4 艘飛船（義大利文卡面）。',
}

// 殖民地 40 張（正面＝未改造，背面＝改造後；upgrade 是翻面要付的紫色轉換器）。climate：J 叢林、W 海洋、D 荒漠、I 冰。
export type SiderealColony = {
  id: string
  name: string
  climate: 'J' | 'W' | 'D' | 'I'
  front: string
  upgrade: string
  backClimate: 'J' | 'W' | 'D' | 'I'
  back: string
}

export const SIDEREAL_COLONIES: SiderealColony[] = [
  { id: 'colony-acrux', name: 'Acrux', climate: 'D', front: '➪b', upgrade: 'ww→', backClimate: 'I', back: '➪bw' },
  { id: 'colony-spica', name: 'Spica', climate: 'I', front: '➪w', upgrade: 'gg→', backClimate: 'W', back: '➪wg' },
  { id: 'colony-antares', name: 'Antares', climate: 'J', front: '➪g', upgrade: 'U→', backClimate: 'I', back: 'g➪U' },
  { id: 'colony-mimosa', name: 'Mimosa', climate: 'I', front: '➪w', upgrade: 'T→', backClimate: 'J', back: '➪T' },
  { id: 'colony-regulus', name: 'Regulus', climate: 'J', front: '➪w', upgrade: 'Y→', backClimate: 'D', back: '➪Y' },
  { id: 'colony-castor', name: 'Castor', climate: 'W', front: '➪w', upgrade: 'B→', backClimate: 'I', back: '➪B' },
  { id: 'colony-miaplacidus', name: 'Miaplacidus', climate: 'W', front: '➪g', upgrade: 'B→', backClimate: 'D', back: '➪B' },
  { id: 'colony-toliman', name: 'Toliman', climate: 'D', front: '➪w', upgrade: 'B→', backClimate: 'I', back: '➪B' },
  { id: 'colony-wezen', name: 'Wezen', climate: 'J', front: '➪b', upgrade: 'B→', backClimate: 'W', back: '➪B' },
  { id: 'colony-mirfak', name: 'Mirfak', climate: 'J', front: '➪g', upgrade: 'B→', backClimate: 'I', back: '➪B' },
  { id: 'colony-benetnasch', name: 'Benetnasch', climate: 'W', front: '➪g', upgrade: 'T→', backClimate: 'J', back: '➪T' },
  { id: 'colony-sargas', name: 'Sargas', climate: 'D', front: '➪b', upgrade: 'Y→', backClimate: 'J', back: '➪Y' },
  { id: 'colony-peacock', name: 'Peacock', climate: 'D', front: '➪b', upgrade: 'B→', backClimate: 'J', back: '➪B' },
  { id: 'colony-koo-she', name: 'Koo She', climate: 'D', front: '➪b', upgrade: 'T→', backClimate: 'W', back: '➪T' },
  { id: 'colony-polaris', name: 'Polaris', climate: 'W', front: '➪b', upgrade: 'Y→', backClimate: 'D', back: '➪Y' },
  { id: 'colony-fomalhaut', name: 'Fomalhaut', climate: 'I', front: '➪b', upgrade: 'U→', backClimate: 'D', back: 'b➪U' },
  { id: 'colony-gacrux', name: 'Gacrux', climate: 'I', front: '➪w', upgrade: 'Y→', backClimate: 'D', back: '➪Y' },
  { id: 'colony-betelgeuse', name: 'Betelgeuse', climate: 'I', front: '➪w', upgrade: 'U→', backClimate: 'J', back: 'w➪U' },
  { id: 'colony-arcturus', name: 'Arcturus', climate: 'I', front: '➪b', upgrade: 'T→', backClimate: 'W', back: '➪T' },
  { id: 'colony-alnair', name: 'Alnair', climate: 'I', front: '➪b', upgrade: 'B→', backClimate: 'W', back: '➪B' },
  { id: 'colony-alioth', name: 'Alioth', climate: 'I', front: '➪w', upgrade: 'bb→', backClimate: 'D', back: '➪wb' },
  { id: 'colony-adara', name: 'Adara', climate: 'J', front: '➪g', upgrade: 'ww→', backClimate: 'I', back: '➪gw' },
  { id: 'colony-sirius', name: 'Sirius', climate: 'J', front: '➪g', upgrade: 'B→', backClimate: 'I', back: '➪B' },
  { id: 'colony-rigel', name: 'Rigel', climate: 'J', front: '➪g', upgrade: 'T→', backClimate: 'W', back: '➪T' },
  { id: 'colony-el-nath', name: 'El Nath', climate: 'J', front: '➪g', upgrade: 'T→', backClimate: 'W', back: '➪T' },
  { id: 'colony-aldebaran', name: 'Aldebaran', climate: 'J', front: '➪b', upgrade: 'Y→', backClimate: 'D', back: '➪Y' },
  { id: 'colony-atria', name: 'Atria', climate: 'J', front: '➪g', upgrade: 'Y→', backClimate: 'D', back: '➪Y' },
  { id: 'colony-alnitak', name: 'Alnitak', climate: 'W', front: '➪g', upgrade: 'U→', backClimate: 'I', back: 'g➪U' },
  { id: 'colony-hadar', name: 'Hadar', climate: 'W', front: '➪g', upgrade: 'Y→', backClimate: 'J', back: '➪Y' },
  { id: 'colony-capella', name: 'Capella', climate: 'W', front: '➪g', upgrade: 'T→', backClimate: 'J', back: '➪T' },
  { id: 'colony-shaula', name: 'Shaula', climate: 'D', front: '➪b', upgrade: 'gg→', backClimate: 'J', back: '➪gb' },
  { id: 'colony-canopus', name: 'Canopus', climate: 'D', front: '➪b', upgrade: 'U→', backClimate: 'I', back: 'b➪U' },
  { id: 'colony-vega', name: 'Vega', climate: 'D', front: '➪b', upgrade: 'T→', backClimate: 'J', back: '➪T' },
  { id: 'colony-altair', name: 'Altair', climate: 'W', front: '➪g', upgrade: 'Y→', backClimate: 'D', back: '➪Y' },
  { id: 'colony-suhail', name: 'Suhail', climate: 'W', front: '➪w', upgrade: 'B→', backClimate: 'I', back: '➪B' },
  { id: 'colony-pollux', name: 'Pollux', climate: 'D', front: '➪w', upgrade: 'T→', backClimate: 'W', back: '➪T' },
  { id: 'colony-deneb', name: 'Deneb', climate: 'I', front: '➪w', upgrade: 'B→', backClimate: 'W', back: '➪B' },
  { id: 'colony-bellatrix', name: 'Bellatrix', climate: 'W', front: '➪w', upgrade: 'Y→', backClimate: 'D', back: '➪Y' },
  { id: 'colony-achernar', name: 'Achernar', climate: 'I', front: '➪w', upgrade: 'T→', backClimate: 'J', back: '➪T' },
  { id: 'colony-procyon', name: 'Procyon', climate: 'D', front: '➪b', upgrade: 'Y→', backClimate: 'W', back: '➪Y' },
]

// 研究團隊 41 張（第 1～3 時代各 7、第 4 時代 20）。costs 是可擇一的發明費用；vp 是印在卡上的分數，另加科技分享獎勵。
// 第 4 時代的科技是發明者獨有，不分享（invents 與團隊同名）。
export type SiderealResearchTeam = {
  id: string
  name: string
  era: number
  costs: Array<{ res: SiderealResKey; n: number }>
  vp: number
  invents: string
}

export const SIDEREAL_RESEARCH_TEAMS: SiderealResearchTeam[] = [
  { id: 'team-mechanical-engineers', name: 'Mechanical Engineers', era: 1, costs: [{ res: 'yellow', n: 4 }, { res: 'ultratech', n: 2 }], vp: 1, invents: 'Nanotechnology' },
  { id: 'team-computational-theoreticians', name: 'Computational Theoreticians', era: 1, costs: [{ res: 'white', n: 6 }, { res: 'blue', n: 4 }], vp: 1, invents: 'Quantum Computers' },
  { id: 'team-linguistic-analysts', name: 'Linguistic Analysts', era: 1, costs: [{ res: 'green', n: 6 }, { res: 'black', n: 4 }], vp: 1, invents: 'Universal Translator' },
  { id: 'team-organic-chemists', name: 'Organic Chemists', era: 1, costs: [{ res: 'brown', n: 6 }, { res: 'blue', n: 4 }], vp: 1, invents: 'Genetic Engineering' },
  { id: 'team-pharmaceutical-scientists', name: 'Pharmaceutical Scientists', era: 1, costs: [{ res: 'green', n: 6 }, { res: 'ultratech', n: 2 }], vp: 1, invents: 'Clinical Immortality' },
  { id: 'team-sociologists', name: 'Sociologists', era: 1, costs: [{ res: 'white', n: 6 }, { res: 'black', n: 4 }], vp: 1, invents: 'Ubiquitous Cultural Repository' },
  { id: 'team-nuclear-physicists', name: 'Nuclear Physicists', era: 1, costs: [{ res: 'brown', n: 6 }, { res: 'yellow', n: 4 }], vp: 1, invents: 'Atomic Transmutation' },
  { id: 'team-comparative-physiologists', name: 'Comparative Physiologists', era: 2, costs: [{ res: 'brown', n: 9 }, { res: 'black', n: 6 }], vp: 3, invents: 'Interspecies Medical Exchange' },
  { id: 'team-n-space-mathematicians', name: 'N-Space Mathematicians', era: 2, costs: [{ res: 'blue', n: 8 }, { res: 'ultratech', n: 4 }], vp: 4, invents: 'Hyperspace Mining' },
  { id: 'team-gravitic-topologists', name: 'Gravitic Topologists', era: 2, costs: [{ res: 'brown', n: 12 }, { res: 'green', n: 12 }], vp: 4, invents: 'Singularity Control' },
  { id: 'team-metaethicists', name: 'Metaethicists', era: 2, costs: [{ res: 'yellow', n: 7 }, { res: 'black', n: 7 }], vp: 4, invents: 'Cross Species Ethical Equality' },
  { id: 'team-quantum-theoreticians', name: 'Quantum Theoreticians', era: 2, costs: [{ res: 'green', n: 9 }, { res: 'blue', n: 6 }], vp: 3, invents: 'Antimatter Power' },
  { id: 'team-quantum-statisticians', name: 'Quantum Statisticians', era: 2, costs: [{ res: 'white', n: 12 }, { res: 'ultratech', n: 4 }], vp: 4, invents: 'Achronal Analysis' },
  { id: 'team-organic-architects', name: 'Organic Architects', era: 2, costs: [{ res: 'white', n: 9 }, { res: 'yellow', n: 6 }], vp: 3, invents: 'Organic Construction' },
  { id: 'team-stellar-architectural-planners', name: 'Stellar Architectural Planners', era: 3, costs: [{ res: 'blue', n: 14 }, { res: 'yellow', n: 14 }], vp: 11, invents: 'Megastructures' },
  { id: 'team-psychohistorians', name: 'Psychohistorians', era: 3, costs: [{ res: 'black', n: 12 }, { res: 'ultratech', n: 6 }], vp: 9, invents: 'Social Exodus' },
  { id: 'team-subquantum-manipulators', name: 'Subquantum Manipulators', era: 3, costs: [{ res: 'green', n: 18 }, { res: 'white', n: 18 }], vp: 9, invents: 'Matter Generation' },
  { id: 'team-memetic-artists', name: 'Memetic Artists', era: 3, costs: [{ res: 'brown', n: 18 }, { res: 'white', n: 18 }], vp: 9, invents: 'Galactic Telecomm Control' },
  { id: 'team-interspecies-managers', name: 'Interspecies Managers', era: 3, costs: [{ res: 'blue', n: 11 }, { res: 'black', n: 11 }], vp: 8, invents: 'Poly Species Corporations' },
  { id: 'team-cultural-diffusionologists', name: 'Cultural Diffusionologists', era: 3, costs: [{ res: 'green', n: 15 }, { res: 'yellow', n: 10 }], vp: 7, invents: 'Xeno Cultural Exchange' },
  { id: 'team-chronophysicists', name: 'Chronophysicists', era: 3, costs: [{ res: 'brown', n: 18 }, { res: 'ultratech', n: 6 }], vp: 9, invents: 'Temporal Dilation' },
  { id: 'team-cultural-polymorphologists', name: 'Cultural Polymorphologists', era: 4, costs: [{ res: 'white', n: 18 }, { res: 'brown', n: 18 }, { res: 'ultratech', n: 6 }], vp: 8, invents: 'Cultural Polymorphologists' },
  { id: 'team-reconstructive-paleobotanists', name: 'Reconstructive Paleobotanists', era: 4, costs: [{ res: 'white', n: 21 }, { res: 'green', n: 21 }, { res: 'ultratech', n: 7 }], vp: 10, invents: 'Reconstructive Paleobotanists' },
  { id: 'team-abiotic-pathologists', name: 'Abiotic Pathologists', era: 4, costs: [{ res: 'white', n: 24 }, { res: 'yellow', n: 18 }, { res: 'ultratech', n: 8 }], vp: 12, invents: 'Abiotic Pathologists' },
  { id: 'team-interphasal-theoreticians', name: 'Interphasal Theoreticians', era: 4, costs: [{ res: 'brown', n: 24 }, { res: 'green', n: 24 }, { res: 'ultratech', n: 8 }], vp: 12, invents: 'Interphasal Theoreticians' },
  { id: 'team-mesoscale-geoengineers', name: 'Mesoscale Geoengineers', era: 4, costs: [{ res: 'brown', n: 27 }, { res: 'yellow', n: 18 }, { res: 'ultratech', n: 9 }], vp: 14, invents: 'Mesoscale Geoengineers' },
  { id: 'team-sapience-developers', name: 'Sapience Developers', era: 4, costs: [{ res: 'white', n: 21 }, { res: 'yellow', n: 14 }, { res: 'black', n: 14 }], vp: 10, invents: 'Sapience Developers' },
  { id: 'team-autonomic-teleoperators', name: 'Autonomic Teleoperators', era: 4, costs: [{ res: 'blue', n: 12 }, { res: 'yellow', n: 12 }, { res: 'black', n: 12 }], vp: 8, invents: 'Autonomic Teleoperators' },
  { id: 'team-fractal-microbiologists', name: 'Fractal Microbiologists', era: 4, costs: [{ res: 'white', n: 21 }, { res: 'green', n: 21 }, { res: 'blue', n: 14 }], vp: 10, invents: 'Fractal Microbiologists' },
  { id: 'team-stellar-plasma-flow-engineers', name: 'Stellar Plasma Flow Engineers', era: 4, costs: [{ res: 'white', n: 21 }, { res: 'blue', n: 14 }, { res: 'black', n: 14 }], vp: 10, invents: 'Stellar Plasma Flow Engineers' },
  { id: 'team-chaos-theoreticians', name: 'Chaos Theoreticians', era: 4, costs: [{ res: 'green', n: 18 }, { res: 'yellow', n: 12 }, { res: 'black', n: 12 }], vp: 8, invents: 'Chaos Theoreticians' },
  { id: 'team-oceanographic-biotechnicians', name: 'Oceanographic Biotechnicians', era: 4, costs: [{ res: 'brown', n: 18 }, { res: 'blue', n: 12 }, { res: 'ultratech', n: 6 }], vp: 8, invents: 'Oceanographic Biotechnicians' },
  { id: 'team-recursive-metatheoreticians', name: 'Recursive Metatheoreticians', era: 4, costs: [{ res: 'white', n: 30 }, { res: 'brown', n: 30 }, { res: 'black', n: 20 }], vp: 16, invents: 'Recursive Metatheoreticians' },
  { id: 'team-singularity-control-technicians', name: 'Singularity Control Technicians', era: 4, costs: [{ res: 'black', n: 20 }, { res: 'blue', n: 20 }, { res: 'ultratech', n: 10 }], vp: 16, invents: 'Singularity Control Technicians' },
  { id: 'team-applied-topologists', name: 'Applied Topologists', era: 4, costs: [{ res: 'white', n: 30 }, { res: 'brown', n: 30 }, { res: 'yellow', n: 20 }], vp: 16, invents: 'Applied Topologists' },
  { id: 'team-metacognitive-ecologists', name: 'Metacognitive Ecologists', era: 4, costs: [{ res: 'green', n: 30 }, { res: 'blue', n: 20 }, { res: 'ultratech', n: 10 }], vp: 16, invents: 'Metacognitive Ecologists' },
  { id: 'team-plasma-auxonologists', name: 'Plasma Auxonologists', era: 4, costs: [{ res: 'green', n: 24 }, { res: 'brown', n: 24 }, { res: 'yellow', n: 16 }], vp: 12, invents: 'Plasma Auxonologists' },
  { id: 'team-psychohistorical-ethicists', name: 'Psychohistorical Ethicists', era: 4, costs: [{ res: 'green', n: 27 }, { res: 'white', n: 27 }, { res: 'black', n: 18 }], vp: 14, invents: 'Psychohistorical Ethicists' },
  { id: 'team-tachyon-astrotechnicians', name: 'Tachyon Astrotechnicians', era: 4, costs: [{ res: 'green', n: 30 }, { res: 'yellow', n: 20 }, { res: 'blue', n: 20 }], vp: 16, invents: 'Tachyon Astrotechnicians' },
  { id: 'team-in-situ-genetic-editors', name: 'In Situ Genetic Editors', era: 4, costs: [{ res: 'green', n: 24 }, { res: 'brown', n: 24 }, { res: 'black', n: 16 }], vp: 12, invents: 'In Situ Genetic Editors' },
  { id: 'team-macroscale-biophysicists', name: 'Macroscale Biophysicists', era: 4, costs: [{ res: 'brown', n: 27 }, { res: 'black', n: 18 }, { res: 'blue', n: 18 }], vp: 14, invents: 'Macroscale Biophysicists' },
]

// 科技分享獎勵（匯流牌）：依人數與回合，bonus＝一般物種，yengii＝Yengii 專用數字
export type SiderealSharingBonus = {
  players: string
  minPlayers: number
  maxPlayers: number | null
  turn: number
  bonus: number
  yengii: number
}

export const SIDEREAL_SHARING_BONUS: SiderealSharingBonus[] = [
  { players: '4-6', minPlayers: 4, maxPlayers: 6, turn: 1, bonus: 6, yengii: 3 },
  { players: '7+', minPlayers: 7, maxPlayers: null, turn: 1, bonus: 7, yengii: 2 },
  { players: '4', minPlayers: 4, maxPlayers: 4, turn: 2, bonus: 5, yengii: 2 },
  { players: '5+', minPlayers: 5, maxPlayers: null, turn: 2, bonus: 6, yengii: 2 },
  { players: '4', minPlayers: 4, maxPlayers: 4, turn: 3, bonus: 4, yengii: 2 },
  { players: '5+', minPlayers: 5, maxPlayers: null, turn: 3, bonus: 5, yengii: 1 },
  { players: '4+', minPlayers: 4, maxPlayers: null, turn: 4, bonus: 4, yengii: 1 },
  { players: '4-5', minPlayers: 4, maxPlayers: 5, turn: 5, bonus: 3, yengii: 1 },
  { players: '6+', minPlayers: 6, maxPlayers: null, turn: 5, bonus: 2, yengii: 0 },
  { players: '4', minPlayers: 4, maxPlayers: 4, turn: 6, bonus: 2, yengii: 0 },
  { players: '5,6', minPlayers: 5, maxPlayers: 6, turn: 6, bonus: 1, yengii: 0 },
  { players: '7+', minPlayers: 7, maxPlayers: null, turn: 6, bonus: 0, yengii: 0 },
]

// 公式符號對照（來源：ods Syntax 工作表，中文為自譯【待核對】）
export const SIDEREAL_NOTATION: Array<{ symbol: string; meaningZh: string }> = [
  { symbol: '➪', meaningZh: '白箭頭：經濟階段執行的轉換器（左邊是投入、右邊是產出）' },
  { symbol: '→', meaningZh: '紫箭頭：交易階段執行的轉換器（打出卡、升級卡、發明科技）' },
  { symbol: '➾', meaningZh: '紅箭頭：Zeth 竊取階段執行的轉換器' },
  { symbol: '+', meaningZh: '前面是一般產出，後面是捐贈品' },
  { symbol: '/', meaningZh: '擇一投入（研究團隊的兩三種發明費用也用斜線分開）' },
  { symbol: '*', meaningZh: '飛船' },
  { symbol: 'g w b', meaningZh: '綠、白、棕（小方塊）' },
  { symbol: 'T Y B', meaningZh: '藍（teal）、黃、黑（大方塊）' },
  { symbol: 'U', meaningZh: '八角塊（超科技）' },
  { symbol: '$', meaningZh: '勝利點' },
  { symbol: 'X', meaningZh: '科技分享獎勵分（發明者領取）' },
  { symbol: 's／L', meaningZh: '任意顏色的小方塊／大方塊' },
  { symbol: 'a／A', meaningZh: '通用（灰色）小方塊／大方塊' },
  { symbol: 'F', meaningZh: 'Im’dril 艦隊支援' },
  { symbol: 'Z', meaningZh: 'Zeth 使節標記' },
  { symbol: '數字', meaningZh: '接在資源符號後面表示數量，例如 s8＝8 個小方塊、g6＝6 個綠' },
  { symbol: 'J W D I N R', meaningZh: '殖民地氣候：叢林、海洋、荒漠、冰；N＝任意世界、R＝遺跡世界' },
  { symbol: ',', meaningZh: '同一張卡上有多個項目' },
  { symbol: '§', meaningZh: '因為有多個轉換器，投入量不固定，列出的是最大投入' },
  { symbol: '½', meaningZh: 'Eni Et 工程師的半價箭頭（擴充）' },
  { symbol: 'o／O', meaningZh: 'Im’dril Grand Fleet 的小／大軌道（擴充）；本檔 Im’dril 艦隊支援費用與 Faderan「Gift of the Duruntai」裡的 O 疑似指八角塊，見檔頭不一致 4' },
]
