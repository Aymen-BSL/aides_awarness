# Quiz Database Setup Instructions

## Import Quiz Tables and Sample Questions

1. **Open phpMyAdmin**: http://localhost/phpmyadmin
2. **Select Database**: Click on `aides_db` in the left sidebar
3. **Click SQL tab** at the top
4. **Copy the contents** of `database/quiz_schema.sql`
5. **Paste into the SQL tab**
6. **Click "Go"** to execute

This will create:

- **3 tables**: `quiz_questions`, `quiz_options`, `quiz_responses`
- **8 sample questions** about HIV/AIDS risk assessment
- **Risk scoring** from 0-100+ points

## Sample Questions Created

1. Rapports sexuels non protégés? (Yes/No - 25 points)
2. Nombre de partenaires sexuels? (Multiple choice - 0-25 points)
3. Test de dépistage du VIH? (Multiple choice - 0-20 points)
4. Consommation de drogues injectables? (Yes/No - 30 points)
5. Symptômes inhabituels? (Yes/No - 15 points)
6. Statut VIH du partenaire? (Multiple choice - 0-20 points)
7. Fréquence d'utilisation des préservatifs? (Multiple choice - 0-30 points)
8. Antécédents d'IST? (Yes/No - 15 points)

**Maximum possible score**: ~165 points

## Risk Levels

- **0-30**: Faible risque (Green)
- **31-60**: Risque modéré (Yellow)
- **61-90**: Risque élevé (Orange)
- **91+**: Risque très élevé (Red)

---

After importing, admins can manage these questions via the Quiz Management interface!
