# iUnitRadar v1 — Калькулятор Unit-экономики B2B SaaS

🔗 **Live Demo:** [https://addito-5g.github.io/iUnitRadar_v1/](https://addito-5g.github.io/iUnitRadar_v1/)

Инструмент для расчёта ключевых метрик (MRR, LTV:CAC, NRR, Churn, ROMI) с возможностью сохранения и шеринга сценариев через ссылку.

## 🚀 Особенности
*   **Полный цикл метрик:** Расчёт MRR/ARR, Logo/Revenue Churn, GRR/NRR, CAC, LTV, Payback Period, Rule of 40 и Health Score.
*   **Remote Sharing:** Генерация уникальных ссылок (`?calc=<uuid>`) для обмена расчётами. Снепшоты хранятся в Supabase (PostgreSQL).
*   **Модульная архитектура:** Проект написан с нуля на чистых ES Modules. Чёткое разделение бизнес-логики, UI и управления состоянием.
*   **Buildless:** Не требует сборщиков (Webpack/Vite) для запуска и деплоя.

## 🛠 Технологии
*   **Frontend:** Vanilla JS (ES Modules), CSS.
*   **Backend:** Supabase (REST API + JSONB).
*   **Deploy:** GitHub Pages.

## ⚙️ Настройка

1.  Создайте проект в [Supabase](https://supabase.com/) и выполните SQL-скрипт из `supabase/schema.sql`.
2.  Заполните `config.js` своими данными:
    ```javascript
    window.__APP_CONFIG__ = {
      supabaseUrl: "https://YOUR_PROJECT.supabase.co",
      supabaseAnonKey: "YOUR_SUPABASE_ANON_KEY"
    };
    ```
3.  Запустите локально: `npx serve .` или `python -m http.server 8080`.

## 📂 Структура проекта
*   `src/lib/` — чистые функции расчётов, валидации и экспорта.
*   `src/state/` — централизованное хранилище состояния (app-store) и работа с localStorage.
*   `src/features/` — UI-компоненты редактора и сервис шеринга.

## 💡 Контекст разработки
Проект реализован самостоятельно с нуля для замены неподдерживаемого legacy-решения. Основная цель — создание прозрачного, расширяемого инструмента с возможностью удалённого доступа к расчётам без необходимости развёртывания собственного бэкенда.
