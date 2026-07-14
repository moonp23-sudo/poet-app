import { Poem } from './types';

export const poemsData: Poem[] = [
  {
    id: 'squirrel',
    title: '아기 다람쥐의 모험',
    author: '이동훈',
    content: [
      '아기 다람쥐 밤송이 하나,',
      '데굴데굴 굴려 가며 놀아요.',
      '엄마 다람쥐 도토리 하나,',
      '볼 가득 물고 숲을 지나요.'
    ],
    subjects: [
      { id: 'sub_1', name: '아기 다람쥐', emoji: '🐿️', isCorrect: true, hint: '시 첫 번째 줄에 나와요. 밤송이를 가지고 놀아요!' },
      { id: 'sub_2', name: '도토리', emoji: '🌰', isCorrect: true, hint: '시 세 번째 줄에 나와요. 엄마 다람쥐가 입에 물고 있어요.' },
      { id: 'sub_3', name: '호랑이', emoji: '🐯', isCorrect: false, hint: '시에는 숲속 무서운 호랑이가 나오지 않아요.' },
      { id: 'sub_4', name: '자전거', emoji: '🚲', isCorrect: false, hint: '다람쥐들은 자전거를 타지 않고 밤송이를 굴려요.' }
    ],
    academicQuestion: {
      word: '비교(比較)하기',
      simplifiedWord: '서로 다른 점이나 같은 점을 살펴보기 (무엇이 다를까?)',
      questionText: '아기 다람쥐가 가지고 노는 밤송이와 엄마 다람쥐가 물고 있는 도토리를 비교하면, 시 속의 다람쥐 가족에 대해 어떤 느낌이 드나요?',
      choices: [
        { id: 'ch_1', text: '다람쥐 가족이 귀엽고 다정하게 느껴져요.', emoji: '🥰', isCorrect: true },
        { id: 'ch_2', text: '외롭고 슬픈 마음이 들어서 눈물이 나요.', emoji: '😢', isCorrect: false },
        { id: 'ch_3', text: '무시무시해서 얼른 도망치고 싶어요.', emoji: '😰', isCorrect: false }
      ],
      guideline: '학생에게 "아기는 가시 가득한 동그란 밤송이로 놀고, 엄마는 맛있는 도토리를 모으고 있어요. 둘이 가진 것이 어떻게 다른지 보면서 느낌을 골라볼까?"라고 질문해 주세요.'
    },
    sentenceCards: [
      { id: 'card_1_1', text: '🐿️ 아기 다람쥐는', category: 'subject', order: 1 },
      { id: 'card_1_2', text: '🌰 밤송이를 데굴데굴 굴리며', category: 'action', order: 2 },
      { id: 'card_1_3', text: '😊 참 신나고 행복해요.', category: 'feeling', order: 3 }
    ],
    correctSequence: ['card_1_1', 'card_1_2', 'card_1_3'],
    translations: {
      en: {
        title: "Baby Squirrel's Adventure",
        content: [
          'Baby squirrel has a chestnut shell,',
          'Rolls it around and plays with it.',
          'Mother squirrel has an acorn,',
          'Passes through the forest with full cheeks.'
        ],
        guide: "Encourage your child by speaking slowly. Focus on the core characters: 'Baby Squirrel' (🐿️) and 'Acorn' (🌰). Read the poem together with hand gestures mimicking rolling objects.",
        homeworkGuide: "Find small round objects at home (like a toy ball or a walnut). Ask your child to roll them, saying 'Roll, roll' in Korean (데굴데굴 - De-gul-de-gul)."
      },
      vi: {
        title: 'Cuộc phiêu lưu của sóc con',
        content: [
          'Sóc con có một quả gai hạt dẻ,',
          'Cứ lăn tròn lăn tròn chơi đùa vui vẻ.',
          'Sóc mẹ có một hạt dẻ nhỏ xinh,',
          'Ngậm đầy má đi qua khu rừng lặng thinh.'
        ],
        guide: "Trẻ có khả năng nghe hiểu rất tốt khi được đọc thành tiếng. Hãy đọc to từng dòng thơ một cách diễn cảm. Nhấn mạnh từ 'Sóc con' (🐿️) và 'Hạt dẻ' (🌰).",
        homeworkGuide: "Ở nhà, hãy cùng trẻ chơi trò lăn đồ vật hình tròn (như quả bóng nhỏ) và nói bằng tiếng Hàn '데굴데굴' (De-gul-de-gul) để rèn luyện vốn từ."
      },
      zh: {
        title: '小松鼠的的冒险',
        content: [
          '小松鼠捧着一个板栗壳，',
          '骨碌骨碌滚着玩。',
          '松鼠妈妈含着一粒橡沙，',
          '塞满脸颊穿过森林。'
        ],
        guide: "孩子对声音的理解力很好。请用温暖的语气朗读这首诗，并用手势比划“滚一滚”（데굴데굴）的动作。把重点放在小松鼠（🐿️）和橡果（🌰）上。",
        homeworkGuide: "在家里，和孩子一起滚圆圆的玩具，并用韩语说“데굴데굴”（De-gul-de-gul，骨碌骨碌），帮助孩子在脑海中建立声音与动作的联系。"
      },
      ja: {
        title: '子リスのぼうけん',
        content: [
          '子リスは いがぐりひとつ、',
          'ころころ ころがして あそびます。',
          'お母さんリスは どんぐりひとつ、',
          'ほっぺに いっぱいくわえて 森をゆきます。'
        ],
        guide: "お子様は耳から聴く情報が得意です。ゆっくりと感情を込めて読み聞かせ、子リス（🐿️）やどんぐり（🌰）を指さしながら声をかけてください。",
        homeworkGuide: "家にある丸いおもちゃを転がしながら、韓国語で「데굴데굴（デグルデグル - ころころ）」と声に出す練習をすると効果的です。"
      }
    }
  },
  {
    id: 'spring_rain',
    title: '봄비 내리는 날',
    author: '김하늘',
    content: [
      '토독 토독 봄비가 내려요,',
      '노란 민들레 입을 벌려요.',
      '새싹들도 쏙쏙 고개 내밀어,',
      '방긋 웃으며 인사해요.'
    ],
    subjects: [
      { id: 'sub_5', name: '노란 민들레', emoji: '🌼', isCorrect: true, hint: '시 두 번째 줄에 나와요. 봄비를 받으려 입을 벌려요.' },
      { id: 'sub_6', name: '새싹', emoji: '🌱', isCorrect: true, hint: '시 세 번째 줄에 나와요. 흙을 뚫고 쏙쏙 고개를 내밀어요.' },
      { id: 'sub_7', name: '눈사람', emoji: '⛄', isCorrect: false, hint: '따뜻한 봄비가 내리는 날이라서 눈사람은 녹아버렸어요.' },
      { id: 'sub_8', name: '불장난', emoji: '🔥', isCorrect: false, hint: '비가 내릴 때는 불을 피우거나 불장난을 하지 않아요.' }
    ],
    academicQuestion: {
      word: '서술(敍述)하기',
      simplifiedWord: '이야기하듯 차례대로 자세히 써보기 (무슨 일이 일어났을까?)',
      questionText: '봄비가 내리자 민들레와 새싹들이 어떻게 하고 있는지 차례차례 자세히 서술하면, 어떤 자연의 분위기가 느껴지나요?',
      choices: [
        { id: 'ch_4', text: '파릇파릇하고 따뜻하며 생명이 가득해요.', emoji: '🌱', isCorrect: true },
        { id: 'ch_5', text: '꽁꽁 얼어붙을 것처럼 춥고 무서워요.', emoji: '🥶', isCorrect: false },
        { id: 'ch_6', text: '천둥 번개가 쳐서 소란스럽고 어지러워요.', emoji: '⚡', isCorrect: false }
      ],
      guideline: '학생에게 "비가 똑똑 내리니까 노란 꽃이 입을 벌려 꿀꺽 마시고, 초록 잎이 쏙 고개를 내밀고 웃고 있어. 이 모습을 자세히 이야기하니까 기분이 어때?"라고 구어로 유도해 주세요.'
    },
    sentenceCards: [
      { id: 'card_2_1', text: '🌼 노란 민들레와 새싹은', category: 'subject', order: 1 },
      { id: 'card_2_2', text: '🌧️ 똑똑 내리는 봄비를 마시며', category: 'action', order: 2 },
      { id: 'card_2_3', text: '💖 마음이 아주 따뜻하고 기뻐요.', category: 'feeling', order: 3 }
    ],
    correctSequence: ['card_2_1', 'card_2_2', 'card_2_3'],
    translations: {
      en: {
        title: 'On a Spring Rainy Day',
        content: [
          'Pitter-patter, spring rain falls,',
          'The yellow dandelion opens its mouth.',
          'The sprouts pop up their heads too,',
          'And greet with a bright smile.'
        ],
        guide: "Listen to the natural sound of rain with your child. Focus on 'Yellow Dandelion' (🌼) and 'Sprout' (🌱). Make popping-up gestures for '쏙쏙' (Spurt-spurt).",
        homeworkGuide: "Look at a small plant or flower near your house. Gently water it together and say, 'Drink the rain! (봄비를 마셔요 - Bom-bi-reul ma-syeo-yo).'"
      },
      vi: {
        title: 'Ngày mưa xuân rơi',
        content: [
          'Tí tách tí tách, mưa xuân rơi,',
          'Hoa bồ công anh vàng mở miệng cười.',
          'Những mầm non cũng nhô đầu lên đón,',
          'Mỉm cười rạng rỡ chào thế giới tuyệt vời.'
        ],
        guide: "Trẻ phản ứng tích cực với âm thanh. Hãy bắt chước tiếng mưa rơi '토독 토독' (To-dok to-dok) và tiếng mầm non mọc '쏙쏙' (Sok-sok) bằng hành động dễ thương.",
        homeworkGuide: "Hãy cùng con tưới nước cho cây xanh ở nhà hoặc ngắm hoa ven đường, cảm nhận sự ấm áp của mùa xuân và nói từ '새싹' (Sae-ssak - Mầm non)."
      },
      zh: {
        title: '春雨绵绵的日子',
        content: [
          '滴答滴答，春雨落下来，',
          '黄黄的的蒲公英张开嘴巴。',
          '嫩芽们也一个个探出头来，',
          '甜甜地笑着打招呼。',
        ],
        guide: "请给孩子用拟声词如“滴答滴答”（토독 토독）展示春天温暖的气息。用双手做小草探头（쏙쏙）的动作，增加互动感。",
        homeworkGuide: "在家跟孩子一起给盆栽浇水，摸摸绿叶，用韩语说“새싹”（Sae-ssak，嫩芽），鼓励孩子用手戳戳泥土，感受生命的触感。"
      },
      ja: {
        title: '春雨が降る日',
        content: [
          'ぱらぱら ぽつぽつ 春雨がふります、',
          '黄色いたんぽぽ お口をあけます。',
          '新芽たちも すくすく顔をのぞかせ、',
          'にこにこ笑って ごあいさつ。'
        ],
        guide: "春雨の「토독 토독（トドッ・トドッ）」や、新芽が伸びる「쏙쏙（ソッソッ）」という擬音語を体で表現しながら、楽しく読み聞かせてあげましょう。",
        homeworkGuide: "植木鉢やお庭の草花にお水をあげながら、韓国語で「봄비（ボムビ - 春雨）」や「민들레（ミンドゥルレ - たんぽぽ）」と声を出してみてください。"
      }
    }
  },
  {
    id: 'autumn_sky',
    title: '반짝이는 가을 하늘',
    author: '정민우',
    content: [
      '파란 가을 하늘 넓고 푸르네,',
      '하얀 솜사탕 구름 둥실 떠 있네.',
      '빨간 고추잠자리 날개 치며,',
      '바람 타고 높이 날아가네.'
    ],
    subjects: [
      { id: 'sub_9', name: '솜사탕 구름', emoji: '☁️', isCorrect: true, hint: '시 두 번째 줄에 나와요. 하늘에 둥실 떠 있는 하얀 구름이에요.' },
      { id: 'sub_10', name: '고추잠자리', emoji: '🪁', isCorrect: true, hint: '시 세 번째 줄에 나와요. 날개를 치며 바람을 타고 높이 날아가요.' },
      { id: 'sub_11', name: '우주선', emoji: '🚀', isCorrect: false, hint: '가을 하늘에 빨간 고추잠자리가 날아가지만 우주선은 없어요.' },
      { id: 'sub_12', name: '수박', emoji: '🍉', isCorrect: false, hint: '맛있는 수박은 가을 하늘 위가 아니라 밭에서 자라요.' }
    ],
    academicQuestion: {
      word: '상징(象徵)과 비유하기',
      simplifiedWord: '모양이나 느낌이 닮은 다른 것에 빗대어 말하기 (뭐랑 닮았지?)',
      questionText: '하늘에 떠 있는 하얀 구름을 ‘솜사탕’이라고 빗대어(상징/비유) 표현한 문장을 읽으면 어떤 기분이 느껴지나요?',
      choices: [
        { id: 'ch_7', text: '솜사탕처럼 달콤하고 가벼워서 기분이 둥실 떠올라요.', emoji: '😋', isCorrect: true },
        { id: 'ch_8', text: '매운 떡볶이를 먹은 것처럼 입안이 맵고 불타올라요.', emoji: '🥵', isCorrect: false },
        { id: 'ch_9', text: '엄청 돌덩이처럼 무겁고 어두워서 숨이 턱 막혀요.', emoji: '😫', isCorrect: false }
      ],
      guideline: '학생에게 "하늘에 솜사탕 구름이 두둥실 떠 있대. 입에 넣으면 사르르 녹아버리는 솜사탕이랑 구름이 닮았나 봐! 이걸 읽으니까 기분이 어때?"라고 비유의 재미를 가르쳐주세요.'
    },
    sentenceCards: [
      { id: 'card_3_1', text: '☁️ 하얀 솜사탕 구름은', category: 'subject', order: 1 },
      { id: 'card_3_2', text: '🪁 바람을 솔솔 타고 가며', category: 'action', order: 2 },
      { id: 'card_3_3', text: '🎈 하늘을 훨훨 나는 기분이에요.', category: 'feeling', order: 3 }
    ],
    correctSequence: ['card_3_1', 'card_3_2', 'card_3_3'],
    translations: {
      en: {
        title: 'Sparkling Autumn Sky',
        content: [
          'Blue autumn sky, wide and deep,',
          'White cotton candy cloud floats gently.',
          'Red dragonfly flaps its wings,',
          'And flies high riding on the wind.'
        ],
        guide: "Imagine eating sweet cotton candy with your child while looking at the blue sky. Focus on 'Cloud' (☁️) and 'Dragonfly' (🪁). Flutter your hands to mimic the dragonfly.",
        homeworkGuide: "Look at the sky during a walk. Ask your child what the clouds look like (e.g. animal shapes), supporting creative metaphors."
      },
      vi: {
        title: 'Bầu trời thu lấp lánh',
        content: [
          'Bầu trời thu xanh biếc, rộng bao la,',
          'Đám mây kẹo bông trắng lững lờ trôi xa.',
          'Chú chuồn chuồn ớt đỏ vỗ cánh nhịp nhàng,',
          'Nương theo làn gió lướt bay cao ngút ngàn.'
        ],
        guide: "Khi nhìn bầu trời xanh rộng lớn, hãy gợi ý trẻ tưởng tượng về đám mây giống chiếc kẹo bông ngọt ngào. Tập trung vào 'Đám mây' (☁️) và 'Chuồn chuồn' (🪁).",
        homeworkGuide: "Khi đi dạo bên ngoài, hãy cùng bé nhìn lên mây và hỏi: 'Mây giống hình con vật nào nhỉ?' nhằm kích thích trí tưởng tượng và vốn từ của trẻ."
      },
      zh: {
        title: '闪耀的秋日天空',
        content: [
          '蓝蓝的的秋天天空，又宽又亮，',
          '白白的棉花糖云朵飘在中央。',
          '红红的红蜻蜓拍着翅膀，',
          '乘着凉爽的秋风飞向远方。'
        ],
        guide: "与孩子共同仰望天空，将云朵比作甜甜的棉花糖。重点关注“棉花糖云”（☁️）和“红蜻蜓”（🪁）。用手指比划蜻蜓飞舞的样子。",
        homeworkGuide: "散步时和孩子一起抬头看天空中的云，问孩子“那个云像什么动物呢？”，帮助孩子用韩语进行生动有趣的联想表达。"
      },
      ja: {
        title: 'きらめく秋の空',
        content: [
          '青い秋の空、広くて深いな、',
          '白いわたあめ雲が ふわり浮かんでいるよ。',
          '赤いアキアカネが 羽をはばたかせ、',
          '風にのって 高く飛んでゆくよ。'
        ],
        guide: "空に浮かぶ雲を「わたあめ（솜사탕）」に例える面白さを伝えてあげましょう。「赤とんぼ（고추잠자리）」や「雲（구름）」を指さして、はばたく動作を真似します。",
        homeworkGuide: "お散步のときに空を見上げ、雲が何に見えるか（犬や車など）をクイズ形式で話しかけ、想像力を豊かにする言葉がけをしてください。"
      }
    }
  },
  {
    id: 'little_cat',
    title: '아기 고양이의 낮잠',
    author: '김정민',
    content: [
      '아기 고양이 낮잠을 자요,',
      '동그랗게 몸을 말고 쌔근쌔근.',
      '분홍빛 작은 발바닥 쏙 내밀고,',
      '따뜻한 햇살 속에서 꿈을 꿔요.'
    ],
    subjects: [
      { id: 'sub_13', name: '아기 고양이', emoji: '🐱', isCorrect: true, hint: '시 첫 번째 줄에 나와요. 쌔근쌔근 잠을 자고 있어요.' },
      { id: 'sub_14', name: '분홍 발바닥', emoji: '🐾', isCorrect: true, hint: '시 세 번째 줄에 나와요. 아기 고양이의 귀여운 분홍 발바닥이에요.' },
      { id: 'sub_15', name: '눈사람', emoji: '⛄', isCorrect: false, hint: '시 속의 고양이는 차가운 겨울 눈사람 대신 따뜻한 햇살 속에서 자고 있어요.' },
      { id: 'sub_16', name: '소방차', emoji: '🚒', isCorrect: false, hint: '시에는 앵앵 소리를 내며 불을 끄는 빨간 소방차가 나오지 않아요.' }
    ],
    academicQuestion: {
      word: '묘사(描寫)하기',
      simplifiedWord: '눈에 보이듯 그림 그리듯 자세히 말하기 (어떻게 생겼지?)',
      questionText: '아기 고양이가 잠자는 모습을 눈에 보듯이 생생하게 그려낸 문장을 읽으니 어떤 마음이 드나요?',
      choices: [
        { id: 'ch_10', text: '포근하고 따뜻해서 아기 고양이처럼 기분이 스르륵 안락해져요.', emoji: '🥰', isCorrect: true },
        { id: 'ch_11', text: '태풍이 부는 것처럼 아주 춥고 무섭고 시끄러워요.', emoji: '🌪️', isCorrect: false },
        { id: 'ch_12', text: '화가 머리끝까지 나서 떼를 쓰고 싶어져요.', emoji: '😡', isCorrect: false }
      ],
      guideline: '학생에게 "아기 고양이가 동그랗게 몸을 말고 쌔근쌔근 자는 모습을 보며 분홍 발바닥을 상상해 봐요. 눈앞에 그림이 펼쳐지는 것 같지 않나요? 어떤 기분이 드는지 골라보세요"라고 자세히 묘사적 질문을 해주세요.'
    },
    sentenceCards: [
      { id: 'card_4_1', text: '🐱 아기 고양이는', category: 'subject', order: 1 },
      { id: 'card_4_2', text: '🐾 분홍 발바닥을 쏙 내밀고', category: 'action', order: 2 },
      { id: 'card_4_3', text: '💤 포근하고 귀여운 꿈을 꿔요.', category: 'feeling', order: 3 }
    ],
    correctSequence: ['card_4_1', 'card_4_2', 'card_4_3'],
    translations: {
      en: {
        title: "Baby Kitten's Nap",
        content: [
          'Baby kitten takes a sweet nap,',
          'Curled up round, breathing softly.',
          'Sticking out tiny pink paws,',
          'Dreaming in the warm sunshine.'
        ],
        guide: "Speak gently as if describing a sleeping kitten. Help your child focus on the characters: 'Baby Kitten' (🐱) and 'Pink Paws' (🐾). Close your eyes and mimic sleeping together.",
        homeworkGuide: "If you have a pet or a stuffed animal, hug it gently and say 'Soft, soft' in Korean (포근포근 - Po-geun-po-geun) to establish sensory links."
      },
      vi: {
        title: 'Mèo con ngủ trưa (아기 고양이의 낮잠)',
        content: [
          'Mèo con đang ngủ trưa ngoan,',
          'Cuộn tròn thân bé thở đều êm ru.',
          'Chìa bàn chân nhỏ hồng hào,',
          'Mơ màng trong nắng ngọt ngào ấm êm.'
        ],
        guide: "아기 고양이가 쌔근쌔근 자는 평화로운 모습을 아이와 함께 나누어 주세요. '아기 고양이(🐱)'와 '분홍 발바닥(🐾)' 단어를 짚어가며 상상력을 기르도록 격려해 주세요.",
        homeworkGuide: "집에 있는 푹신한 동물 인형을 안아주며 한국어의 '포근포근' 느낌을 이야기하고, 따뜻하게 안아주는 사랑을 나누어 주세요."
      },
      zh: {
        title: '小猫咪的午睡 (아기 고양이의 낮잠)',
        content: [
          '小猫咪正在睡午觉，',
          '卷缩着圆圆的小身体，呼噜呼噜。',
          '伸出粉粉的小脚掌，',
          '在温暖的阳光下做着美梦。'
        ],
        guide: "아기 고양이가 쌔근쌔근 자는 평화로운 모습을 아이와 함께 나누어 주세요. '아기 고양이(🐱)'와 '분홍 발바닥(🐾)' 단어를 짚어가며 상상력을 기르도록 격려해 주세요.",
        homeworkGuide: "집에 있는 푹신한 동물 인형을 안아주며 한국어의 '포근포근' 느낌을 이야기하고, 따뜻하게 안아주는 사랑을 나누어 주세요."
      },
      ja: {
        title: '코네코노 히루네 (아기 고양이의 낮잠)',
        content: [
          '코네코가 히루네오 시테이마스,',
          '마루쿠 카라다오 마루메테 스야스야.',
          '핀쿠노 치이사나 니쿠큐오 쵸콘토 다시테,',
          '앗타카이 히자시노 나카데 유메오 미테이마스.'
        ],
        guide: "아기 고양이가 쌔근쌔근 자는 평화로운 모습을 아이와 함께 나누어 주세요. '아기 고양이(🐱)'와 '분홍 발바닥(🐾)' 단어를 짚어가며 상상력을 기르도록 격려해 주세요.",
        homeworkGuide: "집에 있는 푹신한 동물 인형을 안아주며 한국어의 '포근포근' 느낌을 이야기하고, 따뜻하게 안아주는 사랑을 나누어 주세요."
      }
    }
  },
  {
    id: 'night_stars',
    title: '밤하늘의 보석 별',
    author: '박소율',
    content: [
      '어두운 밤하늘 까만 도화지에,',
      '반짝이는 별들이 얼굴을 내밀어요.',
      '은빛 모래알처럼 가만히 흘러가며,',
      '우리들 마음속에 희망을 속삭여요.'
    ],
    subjects: [
      { id: 'sub_17', name: '반짝이는 별', emoji: '✨', isCorrect: true, hint: '시 두 번째 줄에 나와요. 밤하늘을 반짝반짝 빛내고 있어요.' },
      { id: 'sub_18', name: '은빛 모래알', emoji: '🌌', isCorrect: true, hint: '시 세 번째 줄에 나와요. 밤하늘에 반짝이며 깔린 고운 모래 같은 별들이에요.' },
      { id: 'sub_19', name: '고추잠자리', emoji: '🪁', isCorrect: false, hint: '시 속의 어두운 밤하늘에는 가을 고추잠자리가 날아다니지 않아요.' },
      { id: 'sub_20', name: '노란 민들레', emoji: '🌼', isCorrect: false, hint: '민들레는 낮에 피는 봄꽃이에요. 시는 밤하늘의 은빛 별들을 노래하고 있어요.' }
    ],
    academicQuestion: {
      word: '상상(想像)하기',
      simplifiedWord: '눈에 보이지 않는 것을 마음속으로 그려보기 (마음속에 어떤 그림이 떠오르지?)',
      questionText: '까만 밤하늘을 ‘도화지’로, 별들을 ‘은빛 모래알’로 상상해서 표현한 구절을 읽으니 어떤 아름다운 느낌이 떠오르나요?',
      choices: [
        { id: 'ch_13', text: '마음 가득 고운 은빛 별가루 우주가 펼쳐지는 것 같아 행복해요.', emoji: '✨', isCorrect: true },
        { id: 'ch_14', text: '길을 가다가 돌에 걸려 넘어진 것처럼 짜증이 나요.', emoji: '🤕', isCorrect: false },
        { id: 'ch_15', text: '어둡고 사나운 괴물이 튀어나와 쫓아올까 봐 조마조마해요.', emoji: '👻', isCorrect: false }
      ],
      guideline: '학생에게 "까만 밤하늘이 커다란 도화지래! 거기에 별들이 은빛 모래알처럼 반짝반짝 흩어지는 모습을 상상해 볼까? 정말 신기하고 예쁘지 않니? 네 마음에 어떤 그림이 떠오르니?"라고 상상을 북돋아 주세요.'
    },
    sentenceCards: [
      { id: 'card_5_1', text: '✨ 반짝이는 밤하늘 별들은', category: 'subject', order: 1 },
      { id: 'card_5_2', text: '🌌 은빛 모래처럼 고이 흐르며', category: 'action', order: 2 },
      { id: 'card_5_3', text: '💛 마음속 가득 희망을 속삭여요.', category: 'feeling', order: 3 }
    ],
    correctSequence: ['card_5_1', 'card_5_2', 'card_5_3'],
    translations: {
      en: {
        title: "Jewels of the Night Sky",
        content: [
          'On the dark paper of the night sky,',
          'Sparkling stars peek out their faces.',
          'Flowing gently like silver grains of sand,',
          'Whispering hope into our hearts.'
        ],
        guide: "Close your eyes with your child and imagine looking up at a starry night sky. Focus on 'Stars' (✨) and 'Night Sky' (🌌). Whisper 'Twinkle twinkle' together softly.",
        homeworkGuide: "Turn off the lights in a room, and if you have glow-in-the-dark stars or a small flashlight, shine it on the ceiling, saying 'Sparkle sparkle' in Korean (반짝반짝 - Ban-jjak-ban-jjak)."
      },
      vi: {
        title: 'Ngôi sao ngọc bích đêm khuya (밤하늘의 보석 별)',
        content: [
          'Trong tờ giấy vẽ bầu trời đêm tối thẫm,',
          'Những ngôi sao lấp lánh hé lộ khuôn mặt xinh.',
          'Như những hạt cát bạc lặng lẽ trôi dạt,',
          'Thầm thì thắp sáng hy vọng trong tim chúng mình.'
        ],
        guide: "밤하늘 도화지에 은빛 모래알 같은 별들이 반짝이는 신비한 풍경을 머릿속으로 상상해 보도록 공감해 주세요. '반짝이는 별(✨)' 단어를 짚으며 낭독을 격려해 주세요.",
        homeworkGuide: "잠들기 전 불을 끄고 조명을 활용하거나, 함께 밤하늘의 진짜 별들을 바라보며 한국어로 '반짝반짝' 소리 내어 보는 연습을 즐겁게 해보세요."
      },
      zh: {
        title: '夜空中的宝石星星 (밤하늘의 보석 별)',
        content: [
          '在漆黑的夜空画纸上，',
          '闪烁的星星探出脸庞。',
          '像银色的沙粒般静静流淌，',
          '在我们的心田里细语着希望。'
        ],
        guide: "밤하늘 도화지에 은빛 모래알 같은 별들이 반짝이는 신비한 풍경을 머릿속으로 상상해 보도록 공감해 주세요. '반짝이는 별(✨)' 단어를 짚으며 낭독을 격려해 주세요.",
        homeworkGuide: "잠들기 전 불을 끄고 조명을 활용하거나, 함께 밤하늘의 진짜 별들을 바라보며 한국어로 '반짝반짝' 소리 내어 보는 연습을 즐겁게 해보세요."
      },
      ja: {
        title: '요조라노 호세키 보시 (밤하늘의 보석 별)',
        content: [
          '쿠라이 요조라노 쿠로이 가요시니,',
          '키라키라 히카루 호시타치가 카오오 노조카세마스,',
          '기니로노 스나츠부노 요니 시즈카니 나가레나가라,',
          '와타시타치노 코코로노 나카니 키보오 사사야키마스.'
        ],
        guide: "밤하늘 도화지에 은빛 모래알 같은 별들이 반짝이는 신비한 풍경을 머릿속으로 상상해 보도록 공감해 주세요. '반짝이는 별(✨)' 단어를 짚으며 낭독을 격려해 주세요.",
        homeworkGuide: "잠들기 전 불을 끄고 조명을 활용하거나, 함께 밤하늘의 진짜 별들을 바라보며 한국어로 '반짝반짝' 소리 내어 보는 연습을 즐겁게 해보세요."
      }
    }
  }
];

export const translationLabels = {
  ko: '한국어 (기본)',
  en: 'English (영어)',
  vi: 'Tiếng Việt (베트남어)',
  zh: '中文 (중국어)',
  ja: '日本語 (일본어)'
};

export const guideWelcome = {
  ko: {
    title: '학부모/보호자 안내',
    desc: '가정에서 아이와 함께 이 시를 읽으실 때 다음 안내 사항을 읽고 도와주시면 더욱 재미있고 효과적인 공부가 됩니다.'
  },
  en: {
    title: 'Parent/Guardian Guide',
    desc: 'When reading this poem with your child at home, please read the following guidelines to make studying more engaging and effective.'
  },
  vi: {
    title: 'Hướng dẫn dành cho phụ huynh',
    desc: 'Khi đọc bài thơ này cùng con ở nhà, vui lòng đọc các hướng dẫn sau để giúp bé học tập vui vẻ và hiệu quả hơn.'
  },
  zh: {
    title: '家长/监护人指南',
    desc: '在家里与孩子一起读这首诗时，请阅读以下指南，以便更生动、高效地辅助孩子学习。'
  },
  ja: {
    title: '保護者の皆様へ',
    desc: 'ご家庭でお子様と一緒にこの詩を読む際は、以下のガイドラインを参考にサポートしていただくと、より楽しく効果的に学習できます。'
  }
};
