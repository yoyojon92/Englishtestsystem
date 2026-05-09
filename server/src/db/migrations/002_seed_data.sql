-- =====================================================
-- 英语能力测评与课程服务系统 - 测试数据 (Seed Data)
-- PostgreSQL 15+
-- =====================================================

-- =====================================================
-- 1. 测试用户数据 (家长账户)
-- =====================================================

INSERT INTO users (user_id, nickname, phone, avatar, source_channel, status, created_at) VALUES
('11111111-1111-1111-1111-111111111111', '张妈妈', '13800138001', 'https://i.pravatar.cc/150?u=zhang_mom', 'official_website', 'active', '2024-01-15 10:00:00'),
('22222222-2222-2222-2222-222222222222', '李爸爸', '13800138002', 'https://i.pravatar.cc/150?u=li_dad', 'qr_channel', 'active', '2024-02-01 14:30:00'),
('33333333-3333-3333-3333-333333333333', '王妈妈', '13800138003', 'https://i.pravatar.cc/150?u=wang_mom', 'school_referral', 'active', '2024-02-20 09:15:00'),
('44444444-4444-4444-4444-444444444444', '刘爸爸', '13800138004', 'https://i.pravatar.cc/150?u=liu_dad', 'mini_program', 'active', '2024-03-05 16:45:00'),
('55555555-5555-5555-5555-555555555555', '陈妈妈', '13800138005', 'https://i.pravatar.cc/150?u=chen_mom', 'friend_referral', 'active', '2024-03-18 11:20:00'),
('66666666-6666-6666-6666-666666666666', '赵妈妈', '13800138006', 'https://i.pravatar.cc/150?u=zhao_mom', 'official_website', 'active', '2024-04-01 08:00:00'),
('77777777-7777-7777-7777-777777777777', '刘爸爸', '13800138007', 'https://i.pravatar.cc/150?u=liu2_dad', 'school_referral', 'active', '2024-04-10 13:30:00'),
('88888888-8888-8888-8888-888888888888', '孙妈妈', '13800138008', 'https://i.pravatar.cc/150?u=sun_mom', 'mini_program', 'active', '2024-04-25 10:45:00'),
('99999999-9999-9999-9999-999999999999', '周爸爸', '13800138009', 'https://i.pravatar.cc/150?u=zhou_dad', 'qr_channel', 'active', '2024-05-01 15:00:00'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '吴妈妈', '13800138010', 'https://i.pravatar.cc/150?u=wu_mom', 'friend_referral', 'active', '2024-05-15 09:30:00');

-- =====================================================
-- 2. 测试学员数据 (孩子)
-- =====================================================

INSERT INTO children (child_id, user_id, name, gender, birthday, age, grade, current_level, status, created_at) VALUES
-- 张妈妈的孩子们
('c1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '张小明', 'male', '2015-06-15', 9, '三年级', 'A1', 'active', '2024-01-15 10:30:00'),
('c2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', '张小华', 'female', '2018-03-20', 6, '学前班', 'Pre-A1', 'active', '2024-01-15 10:35:00'),

-- 李爸爸的孩子
('c3333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', '李小红', 'female', '2014-09-10', 10, '四年级', 'A2', 'active', '2024-02-01 15:00:00'),

-- 王妈妈的孩子
('c4444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333', '王小强', 'male', '2013-01-25', 11, '五年级', 'A2', 'active', '2024-02-20 09:30:00'),

-- 刘爸爸的孩子
('c5555555-5555-5555-5555-555555555555', '44444444-4444-4444-4444-444444444444', '刘小丽', 'female', '2012-07-08', 12, '六年级', 'B1', 'active', '2024-03-05 17:00:00'),

-- 陈妈妈的孩子
('c6666666-6666-6666-6666-666666666666', '55555555-5555-5555-5555-555555555555', '陈小鹏', 'male', '2016-11-30', 8, '二年级', 'Pre-A1', 'active', '2024-03-18 11:45:00'),

-- 赵妈妈的孩子
('c7777777-7777-7777-7777-777777777777', '66666666-6666-6666-6666-666666666666', '赵小雪', 'female', '2011-04-15', 13, '初一', 'B1', 'active', '2024-04-01 08:30:00'),

-- 刘爸爸2的孩子
('c8888888-8888-8888-8888-888888888888', '77777777-7777-7777-7777-777777777777', '刘小涛', 'male', '2015-02-28', 9, '三年级', 'A1', 'active', '2024-04-10 14:00:00'),

-- 孙妈妈的孩子
('c9999999-9999-9999-9999-999999999999', '88888888-8888-8888-8888-888888888888', '孙小雨', 'female', '2014-12-05', 10, '四年级', 'A2', 'active', '2024-04-25 11:00:00'),

-- 周爸爸的孩子
('caaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '99999999-9999-9999-9999-999999999999', '周小飞', 'male', '2013-08-20', 11, '五年级', 'A2', 'active', '2024-05-01 15:30:00');

-- =====================================================
-- 3. 学员能力画像数据
-- =====================================================

INSERT INTO student_profiles (profile_id, child_id, vocabulary_size, phonics_level, listening_score, speaking_score, reading_score, writing_score, overall_cefr, weak_points, strong_points, last_updated) VALUES
('p1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 800, 'intermediate', 65.5, 60.0, 70.2, 55.8, 'A1', '["writing_grammar", "speaking_fluency"]', '["reading_comprehension", "vocabulary"]', '2024-05-20 10:00:00'),
('p2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 300, 'beginner', 50.0, 55.0, 45.0, 40.0, 'Pre-A1', '["reading_basic", "writing_alphabet"]', '["listening_simple", "speaking_basic"]', '2024-05-18 15:30:00'),
('p3333333-3333-3333-3333-333333333333', 'c3333333-3333-3333-3333-333333333333', 1500, 'advanced', 78.5, 72.0, 82.3, 75.0, 'A2', '["writing_coherence", "speaking_pronunciation"]', '["reading_speed", "vocabulary_range"]', '2024-05-22 09:00:00'),
('p4444444-4444-4444-4444-444444444444', 'c4444444-4444-4444-4444-444444444444', 1800, 'advanced', 80.0, 75.5, 85.0, 78.2, 'A2', '["listening_fast", "writing_essay"]', '["reading_understanding", "grammar"]', '2024-05-21 14:00:00'),
('p5555555-5555-5555-5555-555555555555', 'c5555555-5555-5555-5555-555555555555', 2500, 'proficient', 82.0, 80.5, 88.0, 82.5, 'B1', '["academic_writing", "listening_academic"]', '["speaking_discussion", "reading_analysis"]', '2024-05-23 11:00:00'),
('p6666666-6666-6666-6666-666666666666', 'c6666666-6666-6666-6666-666666666666', 450, 'beginner', 52.0, 58.0, 48.0, 42.0, 'Pre-A1', '["writing_words", "reading_stories"]', '["listening_stories", "speaking_dialogue"]', '2024-05-19 16:30:00'),
('p7777777-7777-7777-7777-777777777777', 'c7777777-7777-7777-7777-777777777777', 3200, 'proficient', 85.0, 82.0, 90.5, 86.0, 'B1', '["time_management", "writing_formal"]', '["speaking_presentation", "reading_academic"]', '2024-05-24 08:30:00'),
('p8888888-8888-8888-8888-888888888888', 'c8888888-8888-8888-8888-888888888888', 900, 'intermediate', 68.0, 62.0, 72.5, 58.0, 'A1', '["writing_sentences", "speaking_complex"]', '["vocabulary_daily", "listening_conversation"]', '2024-05-20 13:00:00'),
('p9999999-9999-9999-9999-999999999999', 'c9999999-9999-9999-9999-999999999999', 1600, 'advanced', 79.0, 74.5, 83.0, 76.5, 'A2', '["writing_paragraph", "speaking_native"]', '["reading_speed", "listening_exam"]', '2024-05-22 10:30:00'),
('paaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'caaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 1900, 'advanced', 81.5, 77.0, 84.0, 79.0, 'A2', '["academic_vocabulary", "writing_creative"]', '["grammar_accuracy", "reading_comprehension"]', '2024-05-21 15:30:00');

-- =====================================================
-- 4. 测试试题数据 (模拟题库)
-- =====================================================

-- Pre-A1 级别试题 (20题)
INSERT INTO question_bank (question_id, type, difficulty, content, options, answer, explanation, cefr_level, source, tags) VALUES
-- 词汇题
('qpre0001', 'vocabulary', 1, '{"text": "What is this?", "image_url": "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=200", "audio_url": ""}', '{"A": "cat", "B": "dog", "C": "bird", "D": "fish"}', 'A', '{"en": "This is a cat, a common pet animal.", "zh": "这是一只猫，一种常见的宠物。"}', 'Pre-A1', 'system', '["animals", "vocabulary_basic"]'),
('qpre0002', 'vocabulary', 1, '{"text": "Choose the correct color: The sky is ___", "audio_url": ""}', '{"A": "red", "B": "blue", "C": "green", "D": "yellow"}', 'B', '{"en": "The sky is blue in a clear day.", "zh": "晴朗的天空是蓝色的。"}', 'Pre-A1', 'system', '["colors", "vocabulary_basic"]'),
('qpre0003', 'vocabulary', 1, '{"text": "How many fingers do you have?", "audio_url": ""}', '{"A": "5", "B": "10", "C": "15", "D": "20"}', 'B', '{"en": "You have 10 fingers, 5 on each hand.", "zh": "你有10根手指，每只手5根。"}', 'Pre-A1', 'system', '["numbers", "vocabulary_basic"]'),
('qpre0004', 'vocabulary', 1, '{"text": "What number comes after 3?", "audio_url": ""}', '{"A": "1", "B": "2", "C": "4", "D": "5"}', 'C', '{"en": "4 comes after 3.", "zh": "4在3之后。"}', 'Pre-A1', 'system', '["numbers", "vocabulary_basic"]'),
('qpre0005', 'vocabulary', 2, '{"text": "Apple, banana, orange are all ___", "audio_url": ""}', '{"A": "animals", "B": "colors", "C": "fruits", "D": "numbers"}', 'C', '{"en": "Apple, banana, and orange are fruits.", "zh": "苹果、香蕉和橙子都是水果。"}', 'Pre-A1', 'system', '["food", "vocabulary_category"]'),
('qpre0006', 'vocabulary', 2, '{"text": "Which word means the opposite of cold?", "audio_url": ""}', '{"A": "hot", "B": "big", "C": "small", "D": "tall"}', 'A', '{"en": "Hot is the opposite of cold.", "zh": "热是冷的反义词。"}', 'Pre-A1', 'system', '["adjectives", "opposites"]'),
('qpre0007', 'vocabulary', 2, '{"text": "What do you use to write?", "audio_url": ""}', '{"A": "pen", "B": "book", "C": "table", "D": "chair"}', 'A', '{"en": "We use a pen to write.", "zh": "我们用笔写字。"}', 'Pre-A1', 'system', '["school", "vocabulary_basic"]'),
('qpre0008', 'vocabulary', 2, '{"text": "Complete: The sun rises in the ___", "audio_url": ""}', '{"A": "west", "B": "south", "C": "east", "D": "north"}', 'C', '{"en": "The sun rises in the east.", "zh": "太阳从东方升起。"}', 'Pre-A1', 'system', '["nature", "vocabulary_basic"]'),
('qpre0009', 'vocabulary', 2, '{"text": "What color is a banana?", "audio_url": ""}', '{"A": "red", "B": "yellow", "C": "blue", "D": "purple"}', 'B', '{"en": "A banana is yellow.", "zh": "香蕉是黄色的。"}', 'Pre-A1', 'system', '["colors", "food"]'),
('qpre0010', 'vocabulary', 2, '{"text": "Choose the correct word: I ___ a student", "audio_url": ""}', '{"A": "is", "B": "am", "C": "are", "D": "be"}', 'B', '{"en": "I am a student is correct.", "zh": "I am a student 是正确的。"}', 'Pre-A1', 'system', '["grammar", "verb_be"]'),
-- 听力题
('qpre0011', 'listening', 2, '{"text": "Listen and choose: What color is the car?", "audio_url": "https://www.example.com/audio/car_blue.mp3"}', '{"A": "red", "B": "blue", "C": "green", "D": "yellow"}', 'B', '{"en": "The audio says the car is blue.", "zh": "音频说汽车是蓝色的。"}', 'Pre-A1', 'system', '["listening_basic", "colors"]'),
('qpre0012', 'listening', 2, '{"text": "Listen and choose: How many cats?", "audio_url": "https://www.example.com/audio/three_cats.mp3"}', '{"A": "2", "B": "3", "C": "4", "D": "5"}', 'B', '{"en": "The audio says there are three cats.", "zh": "音频说有3只猫。"}', 'Pre-A1', 'system', '["listening_basic", "numbers"]'),
('qpre0013', 'listening', 2, '{"text": "Listen and choose: What is the weather like?", "audio_url": "https://www.example.com/audio/sunny.mp3"}', '{"A": "rainy", "B": "cloudy", "C": "sunny", "D": "snowy"}', 'C', '{"en": "The audio says it is sunny today.", "zh": "音频说今天天气晴朗。"}', 'Pre-A1', 'system', '["listening_basic", "weather"]'),
('qpre0014', 'listening', 3, '{"text": "Listen and choose: Where is the book?", "audio_url": "https://www.example.com/audio/book_table.mp3"}', '{"A": "on the table", "B": "under the chair", "C": "in the box", "D": "on the floor"}', 'A', '{"en": "The audio says the book is on the table.", "zh": "音频说书在桌子上。"}', 'Pre-A1', 'system', '["listening_basic", "prepositions"]'),
('qpre0015', 'listening', 3, '{"text": "Listen and choose: What does she like to eat?", "audio_url": "https://www.example.com/audio/likes_apples.mp3"}', '{"A": "apples", "B": "bananas", "C": "oranges", "D": "grapes"}', 'A', '{"en": "The audio says she likes apples.", "zh": "音频说她喜欢苹果。"}', 'Pre-A1', 'system', '["listening_basic", "food"]'),
-- 口语题
('qpre0016', 'speaking', 2, '{"text": "Point and say: What is this?", "prompt": "Please point to the picture and say the word.", "image_url": "https://images.unsplash.com/photo-1527689368864-3a821dbccc34?w=200"}', 'null', 'dog', '{"en": "Good job! You said dog correctly.", "zh": "很好！你正确说出了狗。"}', 'Pre-A1', 'system', '["speaking_basic", "naming"]'),
('qpre0017', 'speaking', 2, '{"text": "Count: How many balls?", "prompt": "Please count the balls out loud.", "image_url": "https://images.unsplash.com/photo-1558050032-160f36233a07?w=200"}', 'null', 'five', '{"en": "Correct! There are five balls.", "zh": "正确！有5个球。"}', 'Pre-A1', 'system', '["speaking_basic", "counting"]'),
('qpre0018', 'speaking', 3, '{"text": "Answer: What is your name?", "prompt": "Please introduce yourself."}', 'null', 'My name is [name]', '{"en": "Great! You introduced yourself well.", "zh": "很棒！你介绍得很好。"}', 'Pre-A1', 'system', '["speaking_basic", "introduction"]'),
('qpre0019', 'speaking', 3, '{"text": "Describe: What color is it?", "prompt": "Look at the picture and describe the color.", "image_url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200"}', 'null', 'It is red', '{"en": "Excellent! You described the red apple correctly.", "zh": "太棒了！你正确描述了红色的苹果。"}', 'Pre-A1', 'system', '["speaking_basic", "describing"]'),
('qpre0020', 'speaking', 3, '{"text": "Respond: How are you today?", "prompt": "Please answer the question."}', 'null', 'I am fine, thank you', '{"en": "Wonderful! Your response is perfect.", "zh": "太棒了！你的回答非常完美。"}', 'Pre-A1', 'system', '["speaking_basic", "response"]');

-- A1 级别试题 (20题)
INSERT INTO question_bank (question_id, type, difficulty, content, options, answer, explanation, cefr_level, source, tags) VALUES
-- 词汇题
('qa10001', 'vocabulary', 2, '{"text": "Choose the correct word: I ___ to school every day.", "audio_url": ""}', '{"A": "go", "B": "goes", "C": "going", "D": "went"}', 'A', '{"en": "I go to school is correct for present simple.", "zh": "I go to school 是一般现在时的正确形式。"}', 'A1', 'system', '["grammar", "present_simple"]'),
('qa10002', 'vocabulary', 2, '{"text": "What is the plural of \"child\"?", "audio_url": ""}', '{"A": "childs", "B": "childrens", "C": "children", "D": "childes"}', 'C', '{"en": "Children is the plural of child.", "zh": "Children是child的复数形式。"}', 'A1', 'system', '["grammar", "plural"]'),
('qa10003', 'vocabulary', 2, '{"text": "Complete: She ___ a nice dress yesterday.", "audio_url": ""}', '{"A": "wear", "B": "wears", "C": "wearing", "D": "wore"}', 'D', '{"en": "Yesterday indicates past tense, so wore is correct.", "zh": "yesterday表示过去时，所以wore是正确的。"}', 'A1', 'system', '["grammar", "past_tense"]'),
('qa10004', 'vocabulary', 3, '{"text": "Which word does NOT belong: apple, banana, carrot, orange?", "audio_url": ""}', '{"A": "apple", "B": "banana", "C": "carrot", "D": "orange"}', 'C', '{"en": "Carrot is a vegetable, not a fruit.", "zh": "胡萝卜是蔬菜，不是水果。"}', 'A1', 'system', '["vocabulary_category", "food"]'),
('qa10005', 'vocabulary', 3, '{"text": "Choose: There ___ many books on the desk.", "audio_url": ""}', '{"A": "is", "B": "are", "C": "be", "D": "been"}', 'B', '{"en": "Books is plural, so use are.", "zh": "books是复数，所以用are。"}', 'A1', 'system', '["grammar", "subject_verb"]'),
-- 阅读题
('qa10006', 'reading', 3, '{"text": "Read and answer: Tom is a boy. He is ten years old. He likes apples. What does Tom like?", "audio_url": ""}', '{"A": "bananas", "B": "apples", "C": "oranges", "D": "grapes"}', 'B', '{"en": "The text says Tom likes apples.", "zh": "文章说Tom喜欢苹果。"}', 'A1', 'system', '["reading_comprehension", "simple_text"]'),
('qa10007', 'reading', 3, '{"text": "Read: I wake up at 7 oclock. I eat breakfast. I go to school. What do I do first?", "audio_url": ""}', '{"A": "eat breakfast", "B": "go to school", "C": "wake up", "D": "play"}', 'C', '{"en": "I wake up first, then eat breakfast, then go to school.", "zh": "我先起床，然后吃早餐，然后去学校。"}', 'A1', 'system', '["reading_comprehension", "sequence"]'),
('qa10008', 'reading', 3, '{"text": "Read and choose: Mary has 3 cats. Tom has 2 cats. Who has more cats?", "audio_url": ""}', '{"A": "Mary", "B": "Tom", "C": "They have the same", "D": "Nobody"}', 'A', '{"en": "Mary has 3 cats, Tom has 2 cats. 3 is more than 2.", "zh": "Mary有3只猫，Tom有2只猫。3比2多。"}', 'A1', 'system', '["reading_comprehension", "comparison"]'),
('qa10009', 'reading', 3, '{"text": "Read: The dog is under the table. The cat is on the chair. Where is the dog?", "audio_url": ""}', '{"A": "on the chair", "B": "under the table", "C": "in the room", "D": "near the window"}', 'B', '{"en": "The text clearly says the dog is under the table.", "zh": "文章明确说狗在桌子下面。"}', 'A1', 'system', '["reading_comprehension", "location"]'),
('qa10010', 'reading', 4, '{"text": "Read: Today is Monday. Tomorrow is Tuesday. Yesterday was Sunday. What day is it today?", "audio_url": ""}', '{"A": "Sunday", "B": "Monday", "C": "Tuesday", "D": "Wednesday"}', 'B', '{"en": "The text says today is Monday.", "zh": "文章说今天是星期一。"}', 'A1', 'system', '["reading_comprehension", "days"]'),
-- 听力题
('qa10011', 'listening', 3, '{"text": "Listen: What time does school start?", "audio_url": "https://www.example.com/audio/school_8am.mp3"}', '{"A": "7 oclock", "B": "8 oclock", "C": "9 oclock", "D": "10 oclock"}', 'B', '{"en": "The audio says school starts at 8 oclock.", "zh": "音频说学校8点开始。"}', 'A1', 'system', '["listening", "time"]'),
('qa10012', 'listening', 3, '{"text": "Listen: Where is the library?", "audio_url": "https://www.example.com/audio/library_second_floor.mp3"}', '{"A": "first floor", "B": "second floor", "C": "third floor", "D": "basement"}', 'B', '{"en": "The audio says the library is on the second floor.", "zh": "音频说图书馆在二楼。"}', 'A1', 'system', '["listening", "location"]'),
('qa10013', 'listening', 4, '{"text": "Listen: What is the boys favorite color?", "audio_url": "https://www.example.com/audio/favorite_blue.mp3"}', '{"A": "red", "B": "green", "C": "blue", "D": "yellow"}', 'C', '{"en": "The audio says blue is his favorite color.", "zh": "音频说他最喜欢的颜色是蓝色。"}', 'A1', 'system', '["listening", "preferences"]'),
('qa10014', 'listening', 4, '{"text": "Listen: How did Lucy go to Beijing?", "audio_url": "https://www.example.com/audio/train_beijing.mp3"}', '{"A": "by plane", "B": "by car", "C": "by train", "D": "by bus"}', 'C', '{"en": "The audio says Lucy went to Beijing by train.", "zh": "音频说Lucy坐火车去北京了。"}', 'A1', 'system', '["listening", "transportation"]'),
('qa10015', 'listening', 4, '{"text": "Listen: What did Tom buy yesterday?", "audio_url": "https://www.example.com/audio/bought_book.mp3"}', '{"A": "a pen", "B": "a book", "C": "a pencil", "D": "an eraser"}', 'B', '{"en": "The audio says Tom bought a book yesterday.", "zh": "音频说Tom昨天买了一本书。"}', 'A1', 'system', '["listening", "past_tense"]'),
-- 写作题
('qa10016', 'writing', 3, '{"text": "Write a sentence using the word \"beautiful\".", "prompt": "Please write one sentence with the word beautiful."}', 'null', '[teacher_scored]', '{"en": "Example: The flower is beautiful.", "zh": "例句：花很美。"}', 'A1', 'system', '["writing", "vocabulary_use"]'),
('qa10017', 'writing', 4, '{"text": "Complete: If it ___ tomorrow, I will stay at home.", "audio_url": ""}', 'null', 'rains', '{"en": "rains is the correct word for third conditional.", "zh": "rains是真实条件句的正确形式。"}', 'A1', 'system', '["writing", "grammar"]'),
('qa10018', 'writing', 4, '{"text": "Write the past tense of these verbs: play, eat, go", "audio_url": ""}', 'null', 'played, ate, went', '{"en": "play-played, eat-ate, go-went.", "zh": "play-played, eat-ate, go-went。"}', 'A1', 'system', '["writing", "past_tense"]'),
('qa10019', 'writing', 4, '{"text": "Arrange words: is / The / big / elephant / an", "audio_url": ""}', 'null', 'The elephant is big', '{"en": "The elephant is big.", "zh": "大象很大。"}', 'A1', 'system', '["writing", "sentence_building"]'),
('qa10020', 'writing', 5, '{"text": "Write 3 sentences about your family.", "prompt": "Please write 3 sentences about your family members."}', 'null', '[teacher_scored]', '{"en": "Example: I have a big family. My mother is a teacher. My father is a doctor.", "zh": "例句：我有一个大家庭。我妈妈是老师。我爸爸是医生。"}', 'A1', 'system', '["writing", "family"]');

-- A2 级别试题 (20题)
INSERT INTO question_bank (question_id, type, difficulty, content, options, answer, explanation, cefr_level, source, tags) VALUES
('qa20001', 'vocabulary', 3, '{"text": "Choose the correct option: She ___ English since 2018.", "audio_url": ""}', '{"A": "studies", "B": "studied", "C": "has studied", "D": "is studying"}', 'C', '{"en": "Since 2018 indicates present perfect.", "zh": "since 2018表示现在完成时。"}', 'A2', 'system', '["grammar", "present_perfect"]'),
('qa20002', 'vocabulary', 3, '{"text": "Which word means \"not afraid\"?", "audio_url": ""}', '{"A": "brave", "B": "scared", "C": "shy", "D": "sad"}', 'A', '{"en": "Brave means not afraid.", "zh": "brave意思是不害怕。"}', 'A2', 'system', '["vocabulary", "adjectives"]'),
('qa20003', 'vocabulary', 4, '{"text": "Complete: The movie was so ___ that I cried.", "audio_url": ""}', '{"A": "boring", "B": "interesting", "C": "exciting", "D": "sad"}', 'D', '{"en": "If someone cried, the movie must have been sad.", "zh": "如果有人哭了，电影一定是感人的。"}', 'A2', 'system', '["vocabulary", "adjectives"]'),
('qa20004', 'vocabulary', 4, '{"text": "Choose: ___ you please help me?", "audio_url": ""}', '{"A": "Can", "B": "Could", "C": "Should", "D": "Might"}', 'B', '{"en": "Could is more polite than can.", "zh": "could比can更礼貌。"}', 'A2', 'system', '["grammar", "modal_verbs"]'),
('qa20005', 'vocabulary', 4, '{"text": "What is the synonym of \"happy\"?", "audio_url": ""}', '{"A": "sad", "B": "angry", "C": "joyful", "D": "tired"}', 'C', '{"en": "Joyful is a synonym of happy.", "zh": "joyful是happy的同义词。"}', 'A2', 'system', '["vocabulary", "synonyms"]'),
('qa20006', 'reading', 4, '{"text": "Read and answer: Sarah went to the store. She bought some milk and bread. Then she went home and made dinner. What did Sarah buy?", "audio_url": ""}', '{"A": "only milk", "B": "only bread", "C": "milk and bread", "D": "milk, bread and vegetables"}', 'C', '{"en": "The text says she bought milk and bread.", "zh": "文章说她买了牛奶和面包。"}', 'A2', 'system', '["reading", "detail_understanding"]'),
('qa20007', 'reading', 4, '{"text": "Read: Tom: Hi, how are you? Lucy: Im fine, thanks. What does Lucy respond?", "audio_url": ""}', '{"A": "Hello", "B": "Im fine, thanks", "C": "Good morning", "D": "Nice to meet you"}', 'B', '{"en": "Lucy says Im fine, thanks.", "zh": "Lucy说她很好，谢谢。"}', 'A2', 'system', '["reading", "dialogue"]'),
('qa20008', 'reading', 4, '{"text": "Read and infer: The sky is dark and there is thunder. What will probably happen?", "audio_url": ""}', '{"A": "It will be sunny", "B": "It will rain", "C": "It will snow", "D": "Nothing will happen"}', 'B', '{"en": "Dark sky and thunder usually mean rain is coming.", "zh": "黑暗的天空和雷声通常意味着要下雨了。"}', 'A2', 'system', '["reading", "inference"]'),
('qa20009', 'reading', 5, '{"text": "Read: The train leaves at 9:00 AM. We need to be at the station by 8:30. The journey takes 3 hours. What time will we arrive?", "audio_url": ""}', '{"A": "11:00 AM", "B": "12:00 PM", "C": "1:00 PM", "D": "12:30 PM"}', 'B', '{"en": "9:00 + 3 hours = 12:00 PM.", "zh": "9:00 + 3小时 = 12:00 PM。"}', 'A2', 'system', '["reading", "calculation"]'),
('qa20010', 'reading', 5, '{"text": "Read: Mark is taller than Tom. Tom is taller than Jim. Who is the shortest?", "audio_url": ""}', '{"A": "Mark", "B": "Tom", "C": "Jim", "D": "They are the same height"}', 'C', '{"en": "If Mark > Tom > Jim, then Jim is the shortest.", "zh": "如果Mark > Tom > Jim，那么Jim最矮。"}', 'A2', 'system', '["reading", "comparison"]'),
('qa20011', 'listening', 4, '{"text": "Listen: What is the weather forecast for tomorrow?", "audio_url": "https://www.example.com/audio/forecast_rain.mp3"}', '{"A": "sunny", "B": "cloudy", "C": "rainy", "D": "windy"}', 'C', '{"en": "The audio says tomorrow will be rainy.", "zh": "音频说明天会下雨。"}', 'A2', 'system', '["listening", "weather"]'),
('qa20012', 'listening', 4, '{"text": "Listen: Where are they planning to go on vacation?", "audio_url": "https://www.example.com/audio/vacation_beach.mp3"}', '{"A": "mountain", "B": "beach", "C": "city", "D": "countryside"}', 'B', '{"en": "The audio says they are going to the beach.", "zh": "音频说他们要去海滩。"}', 'A2', 'system', '["listening", "vacation"]'),
('qa20013', 'listening', 5, '{"text": "Listen: What did the speaker suggest to improve English?", "audio_url": "https://www.example.com/audio/suggest_reading.mp3"}', '{"A": "watch more TV", "B": "read more books", "C": "play more games", "D": "sleep more"}', 'B', '{"en": "The speaker suggested reading more books.", "zh": "演讲者建议多读书。"}', 'A2', 'system', '["listening", "suggestion"]'),
('qa20014', 'listening', 5, '{"text": "Listen: Why did John miss the bus?", "audio_url": "https://www.example.com/audio/missed_bus_late.mp3"}', '{"A": "He was sick", "B": "He woke up late", "C": "The bus was early", "D": "He forgot"}', 'B', '{"en": "The audio says John woke up late.", "zh": "音频说John起床晚了。"}', 'A2', 'system', '["listening", "reason"]'),
('qa20015', 'listening', 5, '{"text": "Listen: How much does the book cost?", "audio_url": "https://www.example.com/audio/book_price.mp3"}', '{"A": "$10", "B": "$15", "C": "$20", "D": "$25"}', 'C', '{"en": "The audio says the book costs $20.", "zh": "音频说这本书20美元。"}', 'A2', 'system', '["listening", "price"]'),
('qa20016', 'writing', 4, '{"text": "Write a paragraph (50-80 words) about your daily routine.", "prompt": "Please write about what you do every day from morning to night."}', 'null', '[teacher_scored]', '{"en": "Example included about waking up, breakfast, school, homework, and bedtime.", "zh": "包含起床、早餐、上学、家庭作业和就寝时间的示例。"}', 'A2', 'system', '["writing", "paragraph"]'),
('qa20017', 'writing', 4, '{"text": "Correct the error: She dont like apples.", "audio_url": ""}', 'null', 'She doesnt like apples', '{"en": "Third person singular needs doesnt.", "zh": "第三人称单数需要doesnt。"}', 'A2', 'system', '["writing", "grammar_correction"]'),
('qa20018', 'writing', 5, '{"text": "Write sentences using: although, however, therefore", "audio_url": ""}', 'null', '[teacher_scored]', '{"en": "Examples showing correct use of these conjunctions.", "zh": "展示这些连词正确用法的例句。"}', 'A2', 'system', '["writing", "connectors"]'),
('qa20019', 'writing', 5, '{"text": "Describe your best friend in 5 sentences.", "prompt": "Please write 5 sentences describing your best friend."}', 'null', '[teacher_scored]', '{"en": "Should include appearance, personality, and why they are your best friend.", "zh": "应该包括外貌、性格，以及为什么他们是你的好朋友。"}', 'A2', 'system', '["writing", "description"]'),
('qa20020', 'writing', 5, '{"text": "Write an email to your teacher explaining why you were absent.", "audio_url": ""}', 'null', '[teacher_scored]', '{"en": "Formal email format with explanation and apology.", "zh": "正式邮件格式，包含解释和道歉。"}', 'A2', 'system', '["writing", "email"]');

-- =====================================================
-- 5. 考试中心数据
-- =====================================================

INSERT INTO exam_centers (center_id, name, city, address, contact_phone, contact_email, latitude, longitude, available_exams, status) VALUES
('ecenter001', '北京海淀区剑桥考试中心', '北京', '北京市海淀区中关村大街1号', '010-88888801', 'beijing@cameng.com', 39.9890, 116.3063, '["KET", "PET", "FCE"]', 'active'),
('ecenter002', '上海黄浦区英语能力测评中心', '上海', '上海市黄浦区南京东路100号', '021-66666602', 'shanghai@cameng.com', 31.2304, 121.4737, '["KET", "PET", "FCE", "YLE"]', 'active'),
('ecenter003', '广州天河区国际考试中心', '广州', '广州市天河区珠江新城花城大道88号', '020-33333303', 'guangzhou@cameng.com', 23.1196, 113.3225, '["KET", "PET", "FCE"]', 'active'),
('ecenter004', '深圳福田区外语考试中心', '深圳', '深圳市福田区福华一路138号', '0755-22222204', 'shenzhen@cameng.com', 22.5431, 114.0579, '["KET", "PET", "FCE", "YLE"]', 'active'),
('ecenter005', '成都锦江区教育考试中心', '成都', '成都市锦江区红星路三段1号', '028-55555505', 'chengdu@cameng.com', 30.6587, 104.0668, '["KET", "PET"]', 'active'),
('ecenter006', '杭州西湖区国际认证考试中心', '杭州', '杭州市西湖区文二西路1号', '0571-77777706', 'hangzhou@cameng.com', 30.2741, 120.1551, '["KET", "PET", "FCE"]', 'active'),
('ecenter007', '武汉武昌区英语能力测试中心', '武汉', '武汉市武昌区中南路7号', '027-88888807', 'wuhan@cameng.com', 30.5728, 114.2770, '["KET", "PET", "YLE"]', 'active'),
('ecenter008', '南京鼓楼区剑桥考试基地', '南京', '南京市鼓楼区中山北路200号', '025-99999908', 'nanjing@cameng.com', 32.0603, 118.7969, '["KET", "PET", "FCE"]', 'active'),
('ecenter009', '西安雁塔区国际教育考试中心', '西安', '西安市雁塔区雁塔路南段1号', '029-11111109', 'xian@cameng.com', 34.2160, 108.9497, '["KET", "PET"]', 'active'),
('ecenter010', '重庆渝中区外语能力测评中心', '重庆', '重庆市渝中区解放碑步行街99号', '023-22222210', 'chongqing@cameng.com', 29.5587, 106.5516, '["KET", "PET", "FCE", "YLE"]', 'active');

-- =====================================================
-- 6. 课程数据
-- =====================================================

INSERT INTO courses (course_id, type, name, description, cover_image, level_required, target_age_min, target_age_max, duration_weeks, lessons_per_week, price, discount_price, teacher_name, max_students, enrolled_count, status, school_id) VALUES
('course001', 'exam_prep', 'KET 考前冲刺班', '针对KET考试的全真模拟和专项训练，快速提升考试通过率', 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400', 'A1', 9, 13, 8, 2, 3999.00, 3499.00, '张老师', 20, 15, 'active', 'school001'),
('course002', 'exam_prep', 'PET 强化训练营', 'PET考试全面备考课程，包含听说读写四项强化训练', 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400', 'A2', 11, 15, 12, 2, 5999.00, 5499.00, '李老师', 18, 12, 'active', 'school001'),
('course003', 'free_talk', '自然拼读启蒙班', '通过自然拼读法培养孩子英语阅读兴趣和基础发音能力', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400', 'Pre-A1', 5, 8, 16, 1, 2999.00, 2599.00, '王老师', 25, 22, 'active', 'school001'),
('course004', 'vocabulary', '剑桥词汇速记班', '高效记忆剑桥考试必备词汇，配套复习和测验', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400', 'A1', 8, 12, 10, 1, 1999.00, 1699.00, '赵老师', 30, 28, 'active', 'school001'),
('course005', 'speaking', '英语口语提升班', '地道口语表达训练，培养英语思维和流利度', 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400', 'A1', 8, 14, 12, 1, 3299.00, 2899.00, '陈老师', 15, 10, 'active', 'school001'),
('course006', 'writing', '英语写作提高班', '从句子到段落，培养英语写作能力和技巧', 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400', 'A2', 10, 15, 8, 2, 2499.00, 2199.00, '刘老师', 20, 18, 'active', 'school001'),
('course007', 'comprehensive', 'YLE Starters 备考班', '剑桥少儿英语Starters级别备考课程', 'https://images.unsplash.com/photo-1509266272358-7701da638078?w=400', 'Pre-A1', 6, 9, 12, 2, 3499.00, 2999.00, '孙老师', 22, 15, 'active', 'school001'),
('course008', 'comprehensive', 'YLE Movers 强化班', '剑桥少儿英语Movers级别能力提升课程', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400', 'Pre-A1', 8, 11, 12, 2, 3799.00, 3299.00, '周老师', 20, 12, 'active', 'school001'),
('course009', 'exam_prep', 'FCE 冲刺班', 'FCE考试全面冲刺，高分通过保障', 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400', 'B1', 13, 17, 16, 3, 8999.00, 7999.00, '吴老师', 15, 8, 'active', 'school001'),
('course010', 'ai_teacher', 'AI外教一对一', '随时随地与AI外教一对一练习口语', 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400', 'Pre-A1', 6, 17, 0, 0, 199.00, 0.00, 'AI外教', 1, 50, 'active', 'school001');

-- =====================================================
-- 7. 测评报告数据
-- =====================================================

INSERT INTO assessment_reports (report_id, child_id, vocabulary_size, phonics_level, listening_score, speaking_score, reading_score, writing_score, overall_cefr, recommendation, generated_at, report_image_url) VALUES
('rpt001', 'c1111111-1111-1111-1111-111111111111', 800, 'intermediate', 65.5, 60.0, 70.2, 55.8, 'A1', '{"course_suggestions": ["自然拼读进阶班", "KET词汇积累"], "exam_suggestions": ["可开始备考KET"], "study_plan": "建议每天30分钟听说读写综合练习"}', '2024-05-15 14:30:00', 'https://example.com/reports/rpt001.png'),
('rpt002', 'c2222222-2222-2222-2222-222222222222', 300, 'beginner', 50.0, 55.0, 45.0, 40.0, 'Pre-A1', '{"course_suggestions": ["自然拼读启蒙班"], "exam_suggestions": ["建议1年后参加YLE Starters"], "study_plan": "从26个字母和基础词汇开始"}', '2024-05-14 10:00:00', 'https://example.com/reports/rpt002.png'),
('rpt003', 'c3333333-3333-3333-3333-333333333333', 1500, 'advanced', 78.5, 72.0, 82.3, 75.0, 'A2', '{"course_suggestions": ["PET强化训练营", "写作提高班"], "exam_suggestions": ["可报名PET考试"], "study_plan": "重点提升写作和口语流利度"}', '2024-05-16 09:00:00', 'https://example.com/reports/rpt003.png'),
('rpt004', 'c4444444-4444-4444-4444-444444444444', 1800, 'advanced', 80.0, 75.5, 85.0, 78.2, 'A2', '{"course_suggestions": ["PET冲刺班"], "exam_suggestions": ["PET考试通过率85%以上"], "study_plan": "每周2次模拟考试+专项训练"}', '2024-05-15 16:00:00', 'https://example.com/reports/rpt004.png'),
('rpt005', 'c5555555-5555-5555-5555-555555555555', 2500, 'proficient', 82.0, 80.5, 88.0, 82.5, 'B1', '{"course_suggestions": ["FCE冲刺班"], "exam_suggestions": ["建议备考PET优秀后冲FCE"], "study_plan": "学术英语能力提升"}', '2024-05-17 11:00:00', 'https://example.com/reports/rpt005.png');

-- =====================================================
-- 8. 模拟考试记录数据
-- =====================================================

INSERT INTO mock_exam_records (record_id, child_id, exam_type, exam_date, reading_score, reading_max, writing_score, writing_max, listening_score, listening_max, speaking_score, speaking_max, total_score, total_max, predicted_grade, pass_confidence_pct, is_pass_ready, created_at) VALUES
('mock001', 'c1111111-1111-1111-1111-111111111111', 'KET', '2024-05-10', 65.0, 100, 58.0, 100, 70.0, 100, 62.0, 100, 255.0, 400, 'Pass', 72.5, false, '2024-05-10 15:00:00'),
('mock002', 'c1111111-1111-1111-1111-111111111111', 'KET', '2024-05-17', 72.0, 100, 65.0, 100, 75.0, 100, 68.0, 100, 280.0, 400, 'Pass', 85.0, true, '2024-05-17 15:00:00'),
('mock003', 'c3333333-3333-3333-3333-333333333333', 'PET', '2024-05-12', 78.0, 100, 72.0, 100, 80.0, 100, 74.0, 100, 304.0, 400, 'Pass with Merit', 88.0, true, '2024-05-12 10:00:00'),
('mock004', 'c4444444-4444-4444-4444-444444444444', 'PET', '2024-05-14', 82.0, 100, 75.0, 100, 78.0, 100, 72.0, 100, 307.0, 400, 'Pass with Merit', 90.0, true, '2024-05-14 14:00:00'),
('mock005', 'c5555555-5555-5555-5555-555555555555', 'PET', '2024-05-18', 85.0, 100, 80.0, 100, 82.0, 100, 78.0, 100, 325.0, 400, 'Pass with Distinction', 95.0, true, '2024-05-18 09:00:00');

-- =====================================================
-- 9. 备考计划数据
-- =====================================================

INSERT INTO exam_prep_plans (plan_id, child_id, exam_type, target_date, current_level, plan_items, progress_pct, created_at) VALUES
('plan001', 'c1111111-1111-1111-1111-111111111111', 'KET', '2024-06-15', 'A1', '["基础词汇积累", "阅读技巧训练", "听力专项强化", "写作模板学习", "口语话题准备", "全真模拟测试"]', 65.0, '2024-05-01 10:00:00'),
('plan002', 'c3333333-3333-3333-3333-333333333333', 'PET', '2024-07-20', 'A2', '["高级词汇记忆", "阅读速度提升", "写作逻辑训练", "听力泛听练习", "口语深度表达", "模拟考试实战"]', 45.0, '2024-05-10 14:00:00'),
('plan003', 'c4444444-4444-4444-4444-444444444444', 'PET', '2024-06-30', 'A2', '["PET真题练习", "薄弱项突破", "全真模拟冲刺", "考试技巧训练"]', 80.0, '2024-04-20 09:00:00');

-- =====================================================
-- 10. 冲刺包订单数据
-- =====================================================

INSERT INTO crash_course_orders (order_id, child_id, exam_type, package_type, amount, mock_exam_quota, remaining_quota, valid_until, status, created_at) VALUES
('crash001', 'c1111111-1111-1111-1111-111111111111', 'KET', 'standard', 199.00, 8, 5, '2024-08-01', 'active', '2024-05-15 16:00:00'),
('crash002', 'c3333333-3333-3333-3333-333333333333', 'PET', 'vip', 249.00, 12, 10, '2024-09-01', 'active', '2024-05-12 11:00:00'),
('crash003', 'c4444444-4444-4444-4444-444444444444', 'PET', 'standard', 249.00, 8, 2, '2024-07-30', 'active', '2024-05-14 15:00:00');

-- =====================================================
-- 11. 支付订单数据
-- =====================================================

INSERT INTO payment_orders (order_id, order_no, user_id, child_id, product_type, product_id, amount, status, paid_at, transaction_id, payment_method, created_at) VALUES
('pay001', 'PAY202405150001', '11111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'assessment', 'asp001', 59.90, 'paid', '2024-05-15 10:30:00', 'WX2024051500001', 'wechat', '2024-05-15 10:00:00'),
('pay002', 'PAY202405160001', '33333333-3333-3333-3333-333333333333', 'c3333333-3333-3333-3333-333333333333', 'assessment', 'asp002', 59.90, 'paid', '2024-05-16 14:00:00', 'WX2024051600001', 'wechat', '2024-05-16 13:30:00'),
('pay003', 'PAY202405170001', '11111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'crash_course', 'crash001', 199.00, 'paid', '2024-05-15 16:10:00', 'WX2024051500002', 'wechat', '2024-05-15 15:30:00'),
('pay004', 'PAY202405180001', '55555555-5555-5555-5555-555555555555', 'c5555555-5555-5555-5555-555555555555', 'course', 'course002', 5499.00, 'paid', '2024-05-18 09:30:00', 'WX2024051800001', 'wechat', '2024-05-18 09:00:00');

-- =====================================================
-- 12. 课后评估报告数据
-- =====================================================

INSERT INTO post_class_reports (report_id, child_id, course_id, teacher_name, ai_conversation_score, vocabulary_accuracy, grammar_accuracy, pronunciation_score, fluency_score, engagement_score, report_content, created_at) VALUES
('pcr001', 'c1111111-1111-1111-1111-111111111111', 'course001', '张老师', 78.5, 82.0, 75.5, 80.0, 72.0, 88.0, '{"summary": "本次课表现良好，词汇掌握扎实，语法还需加强。", "strengths": ["积极参与课堂互动", "词汇记忆准确"], "areas_for_improvement": ["写作语法错误", "口语流利度"], "homework": "完成练习册第15-16页", "next_topic": "一般过去时复习"}', '2024-05-14 17:30:00'),
('pcr002', 'c3333333-3333-3333-3333-333333333333', 'course002', '李老师', 85.0, 88.5, 82.0, 85.0, 80.5, 90.0, '{"summary": "课堂表现优秀，口语表达流畅，语法基础牢固。", "strengths": ["写作思路清晰", "阅读理解准确"], "areas_for_improvement": ["听力细节捕捉"], "homework": "完成PET真题集第3套", "next_topic": "PET听力技巧训练"}', '2024-05-13 18:00:00'),
('pcr003', 'c4444444-4444-4444-4444-444444444444', 'course002', '李老师', 82.0, 85.0, 80.0, 83.0, 78.0, 85.0, '{"summary": "整体表现良好，阅读能力突出，口语需继续练习。", "strengths": ["阅读速度快", "词汇量丰富"], "areas_for_improvement": ["口语发音细节", "写作连接词使用"], "homework": "背诵10个连接词并造句", "next_topic": "口语话题练习"}', '2024-05-15 16:30:00');

-- =====================================================
-- 13. 渠道二维码数据
-- =====================================================

INSERT INTO qr_channels (channel_id, qr_code_url, channel_name, channel_type, school_id, teacher_id, scan_count, conversion_count, created_at) VALUES
('ch001', 'https://api.qrserver.com/v1/create-qr-code/?data=https://h5.example.com/?channel=ch001', '官网首页', 'poster', 'school001', NULL, 1250, 180, '2024-01-01 00:00:00'),
('ch002', 'https://api.qrserver.com/v1/create-qr-code/?data=https://h5.example.com/?channel=ch002', '校区大厅海报', 'poster', 'school001', NULL, 890, 120, '2024-02-01 00:00:00'),
('ch003', 'https://api.qrserver.com/v1/create-qr-code/?data=https://h5.example.com/?channel=ch003', '张老师名片', 'namecard', 'school001', 't001', 256, 85, '2024-03-01 00:00:00'),
('ch004', 'https://api.qrserver.com/v1/create-qr-code/?data=https://h5.example.com/?channel=ch004', '李老师名片', 'namecard', 'school001', 't002', 198, 72, '2024-03-15 00:00:00'),
('ch005', 'https://api.qrserver.com/v1/create-qr-code/?data=https://h5.example.com/?channel=ch005', '宣传折页', 'flyer', 'school001', NULL, 567, 95, '2024-04-01 00:00:00'),
('ch006', 'https://api.qrserver.com/v1/create-qr-code/?data=https://h5.example.com/?channel=ch006', '开放日活动', 'event', 'school001', NULL, 432, 156, '2024-04-20 00:00:00'),
('ch007', 'https://api.qrserver.com/v1/create-qr-code/?data=https://h5.example.com/?channel=ch007', '学校易拉宝', 'banner', 'school001', NULL, 678, 88, '2024-05-01 00:00:00');

-- =====================================================
-- 14. CEFR 定期评估数据
-- =====================================================

INSERT INTO cefr_periodic_assessments (assessment_id, child_id, assess_date, cefr_level, confidence_pct, reading_score, listening_score, speaking_score, writing_score, ready_for_ket, ready_for_pet, next_assess_date, created_at) VALUES
('cef001', 'c1111111-1111-1111-1111-111111111111', '2024-05-15', 'A1', 75.0, 72.5, 68.0, 65.0, 62.0, true, false, '2024-06-15', '2024-05-15 10:00:00'),
('cef002', 'c3333333-3333-3333-3333-333333333333', '2024-05-16', 'A2', 85.0, 85.0, 80.0, 78.5, 75.0, true, true, '2024-06-16', '2024-05-16 14:00:00'),
('cef003', 'c4444444-4444-4444-4444-444444444444', '2024-05-14', 'A2', 88.0, 86.0, 82.0, 80.0, 78.0, true, true, '2024-06-14', '2024-05-14 09:00:00'),
('cef004', 'c5555555-5555-5555-5555-555555555555', '2024-05-17', 'B1', 92.0, 90.0, 88.0, 85.0, 83.0, true, true, '2024-06-17', '2024-05-17 11:00:00');

-- =====================================================
-- 15. 免费课程进度数据
-- =====================================================

INSERT INTO course_progress (progress_id, child_id, course_id, lesson_id, completed, completed_at, quiz_score, created_at) VALUES
-- Pre-A1 Starters Lesson 1 完成
('prog001', 'c1111111-1111-1111-1111-111111111111', 'free001', 'les001', true, '2024-05-10 10:30:00', 85.0, '2024-05-10 10:00:00'),
('prog002', 'c1111111-1111-1111-1111-111111111111', 'free001', 'les002', true, '2024-05-10 11:00:00', 90.0, '2024-05-10 10:30:00'),
('prog003', 'c1111111-1111-1111-1111-111111111111', 'free001', 'les003', false, NULL, NULL, '2024-05-10 11:00:00'),
-- A1 Vocabulary Lesson 1 完成
('prog004', 'c3333333-3333-3333-3333-333333333333', 'free002', 'les001', true, '2024-05-12 15:00:00', 92.0, '2024-05-12 14:30:00'),
('prog005', 'c3333333-3333-3333-3333-333333333333', 'free002', 'les002', true, '2024-05-12 15:45:00', 88.0, '2024-05-12 15:00:00'),
('prog006', 'c3333333-3333-3333-3333-333333333333', 'free002', 'les003', true, '2024-05-13 10:00:00', 95.0, '2024-05-12 15:45:00'),
('prog007', 'c3333333-3333-3333-3333-333333333333', 'free002', 'les004', true, '2024-05-13 10:30:00', 90.0, '2024-05-13 10:00:00'),
('prog008', 'c3333333-3333-3333-3333-333333333333', 'free002', 'les005', false, NULL, NULL, '2024-05-13 10:30:00');

-- =====================================================
-- 完成
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'Seed data inserted successfully!';
    RAISE NOTICE 'Test data summary:';
    RAISE NOTICE '- 10 test users (parents)';
    RAISE NOTICE '- 10 test students (children)';
    RAISE NOTICE '- 50 test questions (Pre-A1: 20, A1: 20, A2: 10)';
    RAISE NOTICE '- 10 exam centers';
    RAISE NOTICE '- 10 courses';
    RAISE NOTICE '- 5 assessment reports';
    RAISE NOTICE '- 5 mock exam records';
    RAISE NOTICE '- 3 exam prep plans';
    RAISE NOTICE '- 3 crash course orders';
    RAISE NOTICE '- 4 payment orders';
    RAISE NOTICE '- 3 post-class reports';
    RAISE NOTICE '- 7 QR channels';
    RAISE NOTICE '- 4 CEFR periodic assessments';
    RAISE NOTICE '- 8 course progress records';
END $$;
