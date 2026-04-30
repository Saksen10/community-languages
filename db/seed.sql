-- Community Languages: Teach and Learn — Seed Data
USE community_languages;

-- ============================================
-- Users (password is 'password123' hashed with bcrypt)
-- ============================================
INSERT INTO users (name, email, password_hash, role, bio, spoken_languages, learning_interests, community_location, points) VALUES
('Amara Okafor', 'amara@example.com', '$2b$10$8KzaNdKIMyOkASYig2iO3OAprRRnSNXgsBMqOatlSbVMFKxXpPiHi', 'teacher', 'Native Yoruba speaker passionate about preserving African languages through interactive teaching.', 'Yoruba, English', 'Hausa, Igbo', 'London, UK', 45),
('Raj Sharma', 'raj@example.com', '$2b$10$8KzaNdKIMyOkASYig2iO3OAprRRnSNXgsBMqOatlSbVMFKxXpPiHi', 'teacher', 'Hindi and Nepali tutor with 10 years of experience teaching South Asian languages to beginners.', 'Hindi, Nepali, English', 'Urdu', 'Birmingham, UK', 60),
('Fatima Hassan', 'fatima@example.com', '$2b$10$8KzaNdKIMyOkASYig2iO3OAprRRnSNXgsBMqOatlSbVMFKxXpPiHi', 'teacher', 'Arabic language enthusiast and community educator helping learners master conversational Arabic.', 'Arabic, English', 'Somali', 'Manchester, UK', 35),
('Tom Wilson', 'tom@example.com', '$2b$10$8KzaNdKIMyOkASYig2iO3OAprRRnSNXgsBMqOatlSbVMFKxXpPiHi', 'learner', 'University student eager to learn community languages to connect with diverse communities.', 'English', 'Hindi, Arabic, Yoruba', 'Leeds, UK', 20),
('Sofia Nowak', 'sofia@example.com', '$2b$10$8KzaNdKIMyOkASYig2iO3OAprRRnSNXgsBMqOatlSbVMFKxXpPiHi', 'learner', 'Polish heritage speaker looking to improve her Polish and learn other community languages.', 'Polish, English', 'Romanian, Bengali', 'Bristol, UK', 15),
('Ahmed Ali', 'ahmed@example.com', '$2b$10$8KzaNdKIMyOkASYig2iO3OAprRRnSNXgsBMqOatlSbVMFKxXpPiHi', 'learner', 'Community volunteer wanting to learn local languages to better support newcomers.', 'Somali, English', 'Arabic, Urdu, Punjabi', 'Sheffield, UK', 10);

-- ============================================
-- Languages
-- ============================================
INSERT INTO languages (name, description) VALUES
('Nepali', 'The official language of Nepal, spoken by millions in the Himalayan region.'),
('Hindi', 'One of the most widely spoken languages in the world, official language of India.'),
('Urdu', 'The national language of Pakistan, closely related to Hindi.'),
('Punjabi', 'A language spoken by the Punjabi people in South Asia.'),
('Bengali', 'The language of Bangladesh and the Indian state of West Bengal.'),
('Arabic', 'A Semitic language spoken across the Middle East and North Africa.'),
('Polish', 'A West Slavic language and the official language of Poland.'),
('Romanian', 'A Romance language spoken primarily in Romania and Moldova.'),
('Somali', 'An Afroasiatic language spoken by the Somali people in the Horn of Africa.'),
('Yoruba', 'A language spoken by the Yoruba people in West Africa, primarily Nigeria.');

-- ============================================
-- Categories
-- ============================================
INSERT INTO categories (name, description) VALUES
('Conversation', 'Practice everyday conversations and dialogue.'),
('Grammar', 'Learn the rules and structure of the language.'),
('Vocabulary', 'Build your word bank and expand your vocabulary.'),
('Reading', 'Improve your reading comprehension skills.'),
('Writing', 'Learn to write in the target language.'),
('Listening', 'Develop your listening and comprehension skills.'),
('Culture', 'Explore the culture behind the language.'),
('Pronunciation', 'Master the sounds and pronunciation of the language.');

-- ============================================
-- Tags
-- ============================================
INSERT INTO tags (name) VALUES
('beginner'), ('alphabet'), ('greetings'), ('family'), ('food'),
('travel'), ('culture'), ('pronunciation'), ('grammar'), ('listening'),
('numbers'), ('colours');

-- ============================================
-- Lessons
-- ============================================
INSERT INTO lessons (teacher_id, language_id, category_id, title, description, content, vocabulary, media_url, difficulty) VALUES
(1, 10, 1, 'Basic Yoruba Greetings', 'Learn essential Yoruba greetings used in everyday life.', 'In Yoruba culture, greetings are very important. They show respect and build community bonds.\n\n**Common Greetings:**\n- E kaaro (Good morning)\n- E kaasan (Good afternoon)\n- E kaaale (Good evening)\n- Bawo ni? (How are you?)\n- Mo wa dada (I am fine)\n\n**Practice:**\nTry greeting your friends using these Yoruba expressions. Remember, tone is very important in Yoruba!', 'E kaaro - Good morning\nE kaasan - Good afternoon\nE kaaale - Good evening\nBawo ni? - How are you?\nMo wa dada - I am fine\nO dabo - Goodbye', NULL, 'beginner'),

(2, 2, 1, 'Hindi Conversational Basics', 'Start speaking Hindi with these essential conversational phrases.', 'Hindi is one of the most spoken languages in the world. Let us begin with basic conversational phrases.\n\n**Essential Phrases:**\n- Namaste (Hello/Greetings)\n- Aap kaise hain? (How are you? formal)\n- Main theek hoon (I am fine)\n- Dhanyavaad (Thank you)\n- Kripya (Please)\n\n**Cultural Note:**\nNamaste is accompanied by joining both palms together, which shows respect.', 'Namaste - Hello\nAap kaise hain? - How are you?\nMain theek hoon - I am fine\nDhanyavaad - Thank you\nKripya - Please\nHaan - Yes\nNahiin - No', NULL, 'beginner'),

(2, 1, 3, 'Nepali Numbers and Counting', 'Master the Nepali number system from 1 to 20.', 'Nepali uses its own script called Devanagari for numbers, but we will learn both the words and their meanings.\n\n**Numbers 1-10:**\n1 - Ek\n2 - Dui\n3 - Teen\n4 - Char\n5 - Panch\n6 - Chha\n7 - Saat\n8 - Aath\n9 - Nau\n10 - Das\n\n**Practice Exercise:**\nCount objects around you using Nepali numbers. Try counting from 1 to 10 five times!', 'Ek - One\nDui - Two\nTeen - Three\nChar - Four\nPanch - Five\nChha - Six\nSaat - Seven\nAath - Eight\nNau - Nine\nDas - Ten', NULL, 'beginner'),

(3, 6, 2, 'Arabic Alphabet Introduction', 'Learn the first 10 letters of the Arabic alphabet with pronunciation guides.', 'Arabic is written from right to left and has 28 letters. Each letter can have up to 4 forms depending on its position in a word.\n\n**First 10 Letters:**\n- Alif (ا)\n- Ba (ب)\n- Ta (ت)\n- Tha (ث)\n- Jim (ج)\n- Ha (ح)\n- Kha (خ)\n- Dal (د)\n- Dhal (ذ)\n- Ra (ر)\n\n**Tips:**\nPractice writing each letter 10 times. Pay attention to dots above and below letters.', 'Alif - First letter\nBa - Second letter\nTa - Third letter\nTha - Fourth letter\nJim - Fifth letter', NULL, 'beginner'),

(1, 10, 7, 'Yoruba Culture and Traditions', 'Explore the rich cultural heritage of the Yoruba people.', 'The Yoruba people have one of the richest cultural traditions in West Africa.\n\n**Key Cultural Elements:**\n- Respect for elders (greeting customs)\n- Oral storytelling traditions\n- Traditional festivals (Egungun, Gelede)\n- Yoruba cuisine (Amala, Ewedu, Jollof Rice)\n- Music and drumming traditions\n\n**Community Values:**\nThe Yoruba concept of Omoluabi describes a person of good character who contributes positively to their community.', NULL, NULL, 'beginner'),

(3, 6, 1, 'Conversational Arabic for Daily Life', 'Learn phrases you will use every day in Arabic-speaking communities.', 'These phrases will help you navigate daily conversations in Arabic.\n\n**Daily Phrases:**\n- Marhaba (Hello)\n- Sabah al-khair (Good morning)\n- Masa al-khair (Good evening)\n- Shukran (Thank you)\n- Afwan (You are welcome)\n- Ma as-salama (Goodbye)\n\n**At the Market:**\n- Bikam? (How much?)\n- Min fadlak/fadlik (Please - m/f)\n- Ayna...? (Where is...?)', 'Marhaba - Hello\nSabah al-khair - Good morning\nShukran - Thank you\nAfwan - You are welcome\nBikam? - How much?', NULL, 'beginner'),

(2, 2, 3, 'Hindi Family Vocabulary', 'Learn to talk about family members in Hindi.', 'Family is central to Indian culture. Let us learn the Hindi words for family members.\n\n**Immediate Family:**\n- Pitaji - Father\n- Mataji - Mother\n- Bhai - Brother\n- Behen - Sister\n- Beta - Son\n- Beti - Daughter\n\n**Extended Family:**\n- Dada/Dadi - Paternal grandfather/grandmother\n- Nana/Nani - Maternal grandfather/grandmother\n- Chacha/Chachi - Paternal uncle/aunt\n- Mama/Mami - Maternal uncle/aunt', 'Pitaji - Father\nMataji - Mother\nBhai - Brother\nBehen - Sister\nBeta - Son\nBeti - Daughter\nParivar - Family', NULL, 'beginner'),

(3, 6, 8, 'Arabic Pronunciation Guide', 'Master the unique sounds of the Arabic language.', 'Arabic has several sounds that do not exist in English. Let us practice them.\n\n**Unique Arabic Sounds:**\n- Ayn (ع) - a deep throat sound\n- Ghayn (غ) - similar to the French R\n- Ha (ح) - a breathy H sound\n- Kha (خ) - like the Scottish loch\n- Qaf (ق) - a deep K sound\n\n**Practice Tips:**\n1. Listen to native speakers\n2. Record yourself and compare\n3. Practice with a mirror to see mouth positions\n4. Start slowly and gradually speed up', NULL, NULL, 'intermediate'),

(1, 10, 3, 'Essential Yoruba Vocabulary: Food', 'Learn food-related vocabulary in Yoruba.', 'Yoruba cuisine is rich and diverse. Learning food vocabulary will help you navigate meals and markets.\n\n**Common Foods:**\n- Iyan - Pounded yam\n- Amala - Yam flour meal\n- Eba - Cassava meal\n- Efo - Vegetable soup\n- Obe - Stew/Sauce\n- Isu - Yam\n- Iresi - Rice\n- Eran - Meat\n- Eja - Fish\n- Omi - Water\n\n**At the Market:**\n- Elo ni eyi? (How much is this?)\n- Mo fe ra... (I want to buy...)', 'Iyan - Pounded yam\nAmala - Yam flour meal\nEba - Cassava meal\nEfo - Vegetable soup\nObe - Stew\nIsu - Yam\nIresi - Rice', NULL, 'beginner'),

(2, 1, 1, 'Everyday Nepali Conversations', 'Practice common Nepali phrases for daily interactions.', 'These phrases will help you in everyday situations in Nepal.\n\n**Greetings:**\n- Namaste (Hello)\n- Tapailai kasto cha? (How are you?)\n- Malai sanchai cha (I am fine)\n- Dhanyabad (Thank you)\n\n**Shopping:**\n- Kati ho? (How much?)\n- Mahango (Expensive)\n- Sasto (Cheap)\n\n**Directions:**\n- Daaya (Right)\n- Baaya (Left)\n- Sidha (Straight)', 'Namaste - Hello\nDhanyabad - Thank you\nKati ho? - How much?\nDaaya - Right\nBaaya - Left\nSidha - Straight', NULL, 'beginner');

-- ============================================
-- Lesson Tags
-- ============================================
INSERT INTO lesson_tags (lesson_id, tag_id) VALUES
(1, 1), (1, 3), (1, 7),
(2, 1), (2, 3),
(3, 1), (3, 11),
(4, 1), (4, 2),
(5, 7),
(6, 1), (6, 3), (6, 6),
(7, 1), (7, 4),
(8, 8),
(9, 1), (9, 5), (9, 7),
(10, 1), (10, 3), (10, 6);

-- ============================================
-- Lesson Progress
-- ============================================
INSERT INTO lesson_progress (learner_id, lesson_id) VALUES
(4, 1), (4, 2), (4, 6),
(5, 3), (5, 4),
(6, 1), (6, 6);

-- ============================================
-- Quiz Questions
-- ============================================
INSERT INTO quiz_questions (lesson_id, question_text, option_a, option_b, option_c, option_d, correct_option) VALUES
(1, 'How do you say "Good morning" in Yoruba?', 'E kaaale', 'E kaaro', 'Bawo ni', 'O dabo', 'B'),
(1, 'What does "Bawo ni?" mean?', 'Goodbye', 'Good morning', 'How are you?', 'Thank you', 'C'),
(2, 'What does "Namaste" mean?', 'Goodbye', 'Thank you', 'Hello/Greetings', 'Please', 'C'),
(2, 'How do you say "Thank you" in Hindi?', 'Kripya', 'Namaste', 'Dhanyavaad', 'Haan', 'C'),
(3, 'What is the Nepali word for the number 5?', 'Char', 'Panch', 'Chha', 'Teen', 'B'),
(4, 'What is the first letter of the Arabic alphabet?', 'Ba', 'Ta', 'Alif', 'Jim', 'C'),
(6, 'How do you say "Thank you" in Arabic?', 'Marhaba', 'Afwan', 'Shukran', 'Bikam', 'C'),
(9, 'What is the Yoruba word for "Rice"?', 'Isu', 'Iresi', 'Eran', 'Eja', 'B');

-- ============================================
-- Quiz Attempts
-- ============================================
INSERT INTO quiz_attempts (learner_id, lesson_id, score, total_questions) VALUES
(4, 1, 2, 2),
(4, 2, 1, 2),
(5, 3, 1, 1);

-- ============================================
-- Forum Posts
-- ============================================
INSERT INTO forum_posts (user_id, language_id, title, body) VALUES
(4, 10, 'Tips for learning Yoruba tones?', 'I am finding Yoruba tones really challenging. The same word can mean different things depending on the tone. Does anyone have tips for practising tones? I have been trying to listen to native speakers but I still struggle with the mid tone vs high tone distinction.'),
(5, 7, 'Polish pronunciation resources', 'Hi everyone! I am looking for good resources to practise Polish pronunciation, especially the sounds like sz, cz, and rz. Any recommendations for websites or apps that focus on Polish sounds?'),
(6, 6, 'Best way to learn Arabic script?', 'I want to learn to read and write Arabic but the script looks very different from what I am used to. Should I start with individual letters or try to learn whole words? Any advice from Arabic learners or teachers would be appreciated!'),
(1, NULL, 'Welcome to the Community Languages forum!', 'Hello everyone! Welcome to our community forum. This is a space to ask questions, share resources, and support each other in our language learning journeys. Feel free to post in any language and do not hesitate to help others. Together we can preserve and celebrate our community languages!'),
(2, 2, 'Hindi vs Urdu - similarities and differences', 'Many people ask me about the relationship between Hindi and Urdu. While they share a lot of vocabulary and grammar, they use different scripts (Devanagari vs Nastaliq) and have different formal registers. Let us discuss!');

-- ============================================
-- Forum Comments
-- ============================================
INSERT INTO forum_comments (post_id, user_id, body) VALUES
(1, 1, 'Great question! I recommend listening to Yoruba music and trying to mimic the melodies. Yoruba tones follow musical patterns. Also, try recording yourself and comparing with native speakers.'),
(1, 6, 'I found that practising with a native speaker in person helped me the most. You can hear the subtle differences much better in real conversation.'),
(3, 3, 'Start with individual letters! Learn 3-4 new letters each day and practise connecting them. The Arabic Alphabetically app is very helpful for beginners.'),
(4, 4, 'Thanks for creating this forum! I am excited to be part of this community.'),
(4, 5, 'This is wonderful! Looking forward to learning and sharing with everyone here.'),
(5, 4, 'This is really interesting! I always wondered why Hindi and Urdu sound so similar but look so different when written.');
