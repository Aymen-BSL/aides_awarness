-- Mock data for Articles
-- Insert sample articles about AIDS awareness (in French)

USE aides_db;

-- Insert mock published articles
INSERT INTO articles (title, content, excerpt, cover_image, status, author_id, published_at) VALUES
(
    'Qu''est-ce que le VIH/SIDA ?',
    'Le VIH (Virus de l''Immunodéficience Humaine) est un virus qui attaque le système immunitaire. Sans traitement, le VIH peut évoluer vers le SIDA (Syndrome d''Immunodéficience Acquise).\n\nLe VIH se transmet par :\n- Les rapports sexuels non protégés\n- Le partage de seringues\n- De la mère à l''enfant pendant la grossesse, l''accouchement ou l''allaitement\n- Le contact avec du sang infecté\n\nIl est important de se faire dépister régulièrement et de connaître son statut. Avec les traitements modernes, les personnes vivant avec le VIH peuvent avoir une vie normale et longue.',
    'Comprendre la différence entre VIH et SIDA, les modes de transmission et l''importance du dépistage.',
    NULL,
    'PUBLISHED',
    1,
    NOW()
),
(
    'L''importance du dépistage',
    'Se faire dépister pour le VIH est un geste simple, rapide et confidentiel qui peut sauver des vies.\n\n**Pourquoi se faire dépister ?**\n- Connaître son statut permet de se protéger et de protéger ses partenaires\n- Un diagnostic précoce permet de commencer un traitement rapidement\n- Les traitements modernes sont très efficaces\n\n**Où se faire dépister ?**\n- Dans les centres de santé\n- Chez votre médecin\n- Dans les associations de lutte contre le SIDA\n- Tests rapides disponibles en pharmacie\n\nLe dépistage est gratuit et anonyme dans la plupart des centres.',
    'Tout ce que vous devez savoir sur le dépistage du VIH : où, quand et pourquoi.',
    NULL,
    'PUBLISHED',
    1,
    DATE_SUB(NOW(), INTERVAL 2 DAY)
),
(
    'Vivre avec le VIH en 2026',
    'Grâce aux progrès de la médecine, vivre avec le VIH aujourd''hui n''est plus ce que c''était il y a 20 ans.\n\n**Les traitements modernes :**\n- Une seule pilule par jour dans la plupart des cas\n- Peu d''effets secondaires\n- Permettent d''avoir une charge virale indétectable\n- Indétectable = Intransmissible (I=I)\n\n**Qualité de vie :**\nAvec un traitement bien suivi, les personnes vivant avec le VIH peuvent :\n- Avoir une espérance de vie normale\n- Travailler normalement\n- Avoir des relations amoureuses\n- Avoir des enfants sans transmission du virus\n\n**Le soutien est important :**\nNe restez pas seul, rejoignez des groupes de soutien et parlez-en à des professionnels de santé.',
    'Les avancées médicales permettent aujourd''hui de vivre normalement avec le VIH. Découvrez comment.',
    NULL,
    'PUBLISHED',
    1,
    DATE_SUB(NOW(), INTERVAL 5 DAY)
),
(
    'Prévention : Les gestes qui sauvent',
    'La prévention reste la meilleure arme contre le VIH. Voici les gestes essentiels :\n\n**1. Utiliser un préservatif**\nLe préservatif (masculin ou féminin) est le seul moyen de protection lors des rapports sexuels.\n\n**2. Ne jamais partager de seringues**\nSi vous consommez des drogues, utilisez toujours du matériel stérile.\n\n**3. Se faire dépister régulièrement**\nSi vous avez des partenaires multiples ou des comportements à risque.\n\n**4. La PrEP (prophylaxie pré-exposition)**\nUn traitement préventif pour les personnes à haut risque.\n\n**5. Le TPE (traitement post-exposition)**\nEn cas d''exposition au VIH, consultez en urgence (dans les 48h).\n\nLa prévention, c''est l''affaire de tous !',
    'Guide complet des moyens de prévention contre le VIH : préservatifs, PrEP, dépistage et plus.',
    NULL,
    'PUBLISHED',
    1,
    DATE_SUB(NOW(), INTERVAL 7 DAY)
),
(
    'Briser les stigmates autour du VIH',
    'Malgré les avancées médicales, les personnes vivant avec le VIH font encore face à la discrimination.\n\n**Les idées reçues à combattre :**\n- Non, le VIH ne se transmet pas par un simple contact\n- Non, toutes les personnes séropositives ne développent pas le SIDA\n- Non, le VIH n''est pas une "maladie honteuse"\n\n**Comment agir ?**\n- S''informer pour mieux comprendre\n- Écouter sans juger\n- Soutenir les personnes concernées\n- Parler ouvertement du sujet\n\n**L''importance des mots :**\nUtilisez toujours un langage respectueux. Les mots peuvent blesser autant qu''ils peuvent guérir.\n\nEnsemble, créons une société plus inclusive et bienveillante.',
    'Luttons ensemble contre la stigmatisation et la discrimination des personnes vivant avec le VIH.',
    NULL,
    'PUBLISHED',
    1,
    DATE_SUB(NOW(), INTERVAL 10 DAY)
);

-- Insert a draft article
INSERT INTO articles (title, content, excerpt, status, author_id) VALUES
(
    'Les nouvelles avancées dans la recherche',
    'Cet article est en cours de rédaction et sera publié prochainement...',
    'Découvrez les dernières avancées dans la recherche sur le VIH/SIDA.',
    'DRAFT',
    1
);

SELECT 'Mock articles created successfully!' as message;
SELECT COUNT(*) as published_articles FROM articles WHERE status = 'PUBLISHED';
